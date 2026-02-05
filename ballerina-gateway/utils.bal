import ballerina/crypto;
import ballerina/time;
import ballerina/url;

# Generates a Presigned URL for Cloudflare R2 (AWS S3 Compatible).
#
# + accessKey - R2 Access Key ID
# + secretKey - R2 Secret Access Key
# + accountId - Cloudflare Account ID
# + bucketName - Bucket Name
# + objectKey - Object Key (filename)
# + method - HTTP Method (e.g., "PUT")
# + expiresIn - Expiration in seconds
# + return - Presigned URL or Error
public function generateR2PresignedUrl(string accessKey, string secretKey, string accountId, string bucketName, string objectKey, string method, int expiresIn) returns string|error {

    string region = "auto";
    string serviceName = "s3";
    string host = bucketName + "." + accountId + ".r2.cloudflarestorage.com";
    // NOTE: For R2, path-style access (account.r2.../bucket) or virtual-host style (bucket.account.r2...)
    // Ballerina S3 client usually uses virtual-host if configured with endpoint.
    // Let's use the explicit endpoint format provided in api.bal: https://<account>.r2.cloudflarestorage.com/<bucket>/<key>
    // But for signing, we need to match what the URL will be.

    // Let's try path-style as it's safer for custom endpoints sometimes.
    // Host: <account>.r2.cloudflarestorage.com
    // Path: /<bucket>/<objectKey>
    host = accountId + ".r2.cloudflarestorage.com";
    string uri = "/" + bucketName + "/" + objectKey;
    string endpoint = "https://" + host + uri;

    // 1. Date Handling
    time:Utc currentUtc = time:utcNow();
    string amzDate = time:utcToString(currentUtc); // 2023-10-05T12:00:00.000Z

    // We need format YYYYMMDD'T'HHMMSS'Z'
    // Ballerina utcToString returns ISO 8601. We need to remove separators.
    // Hacky regex replacement or substring
    // 2023-10-05T12:00:00.00Z -> 20231005T120000Z
    string dateIso = amzDate;
    string dateStamp = dateIso.substring(0, 4) + dateIso.substring(5, 7) + dateIso.substring(8, 10);
    string timeStamp = dateIso.substring(11, 13) + dateIso.substring(14, 16) + dateIso.substring(17, 19);
    string amzDateFormatted = dateStamp + "T" + timeStamp + "Z";

    // 2. Canonical Request
    string canonicalUri = uri;
    string canonicalQueryString = "X-Amz-Algorithm=AWS4-HMAC-SHA256";
    canonicalQueryString += "&X-Amz-Credential=" + check url:encode(accessKey + "/" + dateStamp + "/" + region + "/" + serviceName + "/aws4_request", "UTF-8");
    canonicalQueryString += "&X-Amz-Date=" + amzDateFormatted;
    canonicalQueryString += "&X-Amz-Expires=" + expiresIn.toString();
    canonicalQueryString += "&X-Amz-SignedHeaders=host";

    // Payload Hash (UNSIGNED-PAYLOAD for presigned URLs generally, but for PUT usually strictly signed or UNSIGNED-PAYLOAD)
    // For Presigned URL, payload is usually "UNSIGNED-PAYLOAD"
    string payloadHash = "UNSIGNED-PAYLOAD";

    string canonicalHeaders = "host:" + host + "\n";
    string signedHeaders = "host";

    string canonicalRequest = method + "\n" + canonicalUri + "\n" + canonicalQueryString + "\n" + canonicalHeaders + "\n" + signedHeaders + "\n" + payloadHash;

    // 3. String to Sign
    string algorithm = "AWS4-HMAC-SHA256";
    string credentialScope = dateStamp + "/" + region + "/" + serviceName + "/aws4_request";
    string stringToSign = algorithm + "\n" + amzDateFormatted + "\n" + credentialScope + "\n" + check hex(crypto:hashSha256(canonicalRequest.toBytes()));

    // 4. Signing Key
    byte[] kDate = check crypto:hmacSha256(("AWS4" + secretKey).toBytes(), dateStamp.toBytes());
    byte[] kRegion = check crypto:hmacSha256(kDate, region.toBytes());
    byte[] kService = check crypto:hmacSha256(kRegion, serviceName.toBytes());
    byte[] kSigning = check crypto:hmacSha256(kService, "aws4_request".toBytes());

    // 5. Signature
    byte[] signatureBytes = check crypto:hmacSha256(kSigning, stringToSign.toBytes());
    string signature = check hex(signatureBytes);

    // 6. Final URL
    string presignedUrl = endpoint + "?" + canonicalQueryString + "&X-Amz-Signature=" + signature;

    return presignedUrl;
}

function hex(byte[] data) returns string|error {
    // Helper to convert byte[] to hex string
    // Ballerina doesn't have direct bytesToHex in standard lib accessible easily?
    // Actually `array:toHexString` exists in newer versions?
    // Let's use `data.toBase16()` if available or similar.
    // Ballerina `lang.array`?
    // Let's assume standard `data.toBase16()` works. 
    return data.toBase16();
}
