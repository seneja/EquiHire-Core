import ballerina/http;
import ballerina/io;
import ballerina/sql;
import ballerinax/postgresql;

// Helper to broadcast (needs to be shared or re-implemented if cross-file)
// For now, we keep it simple. If 'webClients' is in `websocket.bal`, we can't access it easily without a shared module.
// So we will just Log for this version.

// --- Data Types ---

type OrganizationRequest record {
    string name;
    string industry;
    string size;
    string userEmail;
    string userId;
};

type OrganizationResponse record {
    string id;
    string name;
    string industry;
    string size;
};

type DatabaseConfig record {
    string host;
    int port;
    string user;
    string password;
    string name;
};

// --- Configuration ---

configurable DatabaseConfig database = ?;

// --- Clients ---

final postgresql:Client dbClient = check new (
    host = database.host,
    username = database.user,
    password = database.password,
    database = database.name,
    port = database.port
);

// --- HTTP Service for API (Port 9092) ---
listener http:Listener apiListener = new (9092);

@http:ServiceConfig {
    cors: {
        allowOrigins: ["*"],
        allowCredentials: true,
        allowHeaders: ["Content-Type", "Authorization"]
    }
}
service /api on apiListener {

    resource function post organizations(@http:Payload OrganizationRequest payload) returns http:Created|error {
        io:println("NEW ORGANIZATION REGISTRATION REQUEST RECEIVED");

        // Transaction to ensure both Organization and Recruiter are created, or neither
        // Transaction to ensure both Organization and Recruiter are created, or neither
        transaction {
            // 1. Insert Organization
            sql:ParameterizedQuery orgQuery = `INSERT INTO organizations (name, industry, size) 
                                             VALUES (${payload.name}, ${payload.industry}, ${payload.size}) 
                                             RETURNING id`;
            // Using check allows automatic rollback on error
            string orgId = check dbClient->queryRow(orgQuery);

            io:println("Organization Created: ", orgId);

            // 2. Insert Recruiter (User) linked to Organization
            sql:ParameterizedQuery recruiterQuery = `INSERT INTO recruiters (user_id, email, organization_id, role) 
                                                   VALUES (${payload.userId}::uuid, ${payload.userEmail}, ${orgId}::uuid, 'admin')`;
            _ = check dbClient->execute(recruiterQuery);

            // Transaction auto-commits at the end of the block if successful
            check commit;
        }

        return http:CREATED;
    }

    resource function get me/organization(string userId) returns OrganizationResponse|http:NotFound|error {
        sql:ParameterizedQuery query = `SELECT o.id, o.name, o.industry, o.size 
                                        FROM organizations o
                                        JOIN recruiters r ON o.id = r.organization_id
                                        WHERE r.user_id = ${userId}::uuid`;

        OrganizationResponse|sql:Error result = dbClient->queryRow(query);

        if result is sql:NoRowsError {
            return http:NOT_FOUND;
        }

        return result;
    }

    resource function put organization(@http:Payload OrganizationResponse payload, string userId) returns http:Ok|http:Forbidden|error {
        // Security check: Ensure the user belongs to this organization
        sql:ParameterizedQuery checkQuery = `SELECT 1 FROM recruiters 
                                              WHERE user_id = ${userId}::uuid AND organization_id = ${payload.id}::uuid`;
        int|sql:Error|sql:NoRowsError checkResult = dbClient->queryRow(checkQuery);

        if checkResult is sql:NoRowsError {
            return http:FORBIDDEN;
        }

        sql:ParameterizedQuery updateQuery = `UPDATE organizations 
                                               SET industry = ${payload.industry}, size = ${payload.size}
                                               WHERE id = ${payload.id}::uuid`;

        sql:ExecutionResult|sql:Error result = dbClient->execute(updateQuery);

        if result is sql:Error {
            return error("Failed to update organization");
        }

        return http:OK;
    }
}
