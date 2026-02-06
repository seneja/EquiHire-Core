import json
import random
import os
import re

path = '/home/hasithaerandika/Documents/Projects/EquiHire-Core/python-ai-engine/sri_lankan_employee_ner_dataset.json'

# Tag Schema
# 0: O
# 1: B-PER, 2: I-PER
# 3: B-ORG, 4: I-ORG
# 5: B-LOC, 6: I-LOC
# 7: B-MISC (SKILL), 8: I-MISC (SKILL) - Using MISC/SKILL for languages/tech

TAG_O = 0
TAG_B_PER = 1
TAG_I_PER = 2
TAG_B_ORG = 3
TAG_I_ORG = 4
TAG_B_LOC = 5
TAG_I_LOC = 6
TAG_B_SKILL = 7
TAG_I_SKILL = 8

# ENTITY DATA
first_names = ["Kasun", "Hasitha" "Nuwan", "Chathura", "Dilshan", "Hashini", "Nimal", "Kamal", "Chamara", "Lahiru", "Amila", "Ruwan", "Saman", "Mahesh", "Dinuka", "Kalpani", "Nadeesha", "Ravindu", "Gayan", "Dulanjali", "Navindu", "Savindu", "Vidura", "Dilani", "Kavindu", "Tharindu", "Isher", "Shehan", "Malith", "Janaka", "Priyantha", "Kumara", "Sanjeewa", "Bandara", "Perera", "Silva", "Fernando", "Roshan", "Suresh", "Lakmal", "Dinesh", "Manjula", "Thilini", "Pavithra"]
last_names = ["Perera", "Silva", "Fernando", "De Silva", "Bandara", "Jayasinghe", "Dissanayake", "Ranasinghe", "Karunaratne", "Herath", "Ekanayake", "Gunaratne", "Wickramasinghe", "Senanayake", "Liyanage", "Gamage", "Abeysekera", "Samarasinghe", "Tennakoon", "Wijeratne", "Samaraweera", "Rajapaksa", "Weerasinghe", "Kulathunga", "Jayawardena"]

universities = [
    # State
    "University of Colombo", "University of Peradeniya", "University of Moratuwa",
    "University of Sri Jayewardenepura", "University of Kelaniya", "University of Ruhuna",
    "University of Jaffna", "Eastern University", "South Eastern University",
    "Rajarata University", "Sabaragamuwa University", "Wayamba University",
    "Uva Wellassa University", "Open University of Sri Lanka", "University of the Visual and Performing Arts",
    "Gampaha Wickramarachchi University", "Ocean University of Sri Lanka",
    
    # Non-state
    "SLIIT", "IIT", "NSBM Green University", "CINEC Campus", "Horizon Campus",
    "ESOFT Metro Campus", "NIBM", "APIIT", "ICBT Campus", "Saegis Campus",
    "KAATSU International University", "Gateway Graduate School", "ACBT",
    "KIU", "Royal Institute of Colombo", "BMS", "BCAS Campus", "IDM Nations Campus",
    "Sri Lanka Technological Campus", "SLTC"
]

companies = [
    "WSO2", "IFS", "Virtusa", "99x", "Sysco LABS", "Pearson", "CodeGen", 
    "LSEG", "MillenniumIT", "Cake Engineering", "John Keells Holdings", "Dialog Axiata",
    "Mobitel", "MAS Holdings", "Brandix", "HNB", "Sampath Bank", "Commercial Bank",
    "Surge Global", "Fortude", "Tiqri", "Zone24x7", "Cambio Software Engineering",
    "Creative Software", "Rootcode Labs", "Calcey Technologies", "PickMe", "Daraz",
    "DirectFN", "Gevek", "Aeturnum", "Code94"
]

locations = [
    "Colombo", "Kandy", "Galle", "Matara", "Jaffna", "Kurunegala", "Gampaha",
    "Negombo", "Kalutara", "Batticaloa", "Trincomalee", "Anuradhapura", "Polonnaruwa",
    "Badulla", "Nuwara Eliya", "Ratnapura", "Kegalle", "Hambantota", "Malabe",
    "Nugegoda", "Dehiwala", "Mount Lavinia", "Moratuwa", "Maharagama", "Kottawa",
    "Rajagiriya", "Battaramulla", "Nawala", "Kiribathgoda", "Panadura", "Horana",
    "Piliyandala", "Homagama", "Athurugiriya"
]

jobs = [
    "Software Engineer", "Senior Software Engineer", "Associate Tech Lead", "Tech Lead",
    "QA Engineer", "Automation Engineer", "UI/UX Designer",
    "DevOps Engineer", "Data Scientist", "Machine Learning Engineer", "AI Engineer",
    "Full Stack Developer", "Frontend Developer", "Backend Developer", "Mobile App Developer",
    "Systems Engineer", "Network Engineer", "Database Administrator", "Cloud Engineer",
    "Cyber Security Analyst", "Information Security Manager", "Solutions Architect",
    "Product Owner", "Scrum Master", "Business Analyst", "Data Engineer",
    "Cloud Architect", "Site Reliability Engineer"
]

degrees = [
    "Computer Science", "Software Engineering", "Information Technology",
    "Data Science", "Cyber Security", "Networking", "Information Systems",
    "Computer Systems Engineering", "Artificial Intelligence", "Computer Networking",
    "Management Information Systems"
]

skills = [
    "Python", "Java", "C++", "C#", "JavaScript", "TypeScript", "React", "Angular",
    "Vue.js", "Node.js", "Sprint Boot", "Django", "Flask", "FastAPI", "SQL", "NoSQL",
    "MongoDB", "PostgreSQL", "MySQL", "Oracle", "AWS", "Azure", "GCP", "Docker",
    "Kubernetes", "Terraform", "Jenkins", "Git", "CI/CD", "Machine Learning",
    "Deep Learning", "NLP", "TensorFlow", "PyTorch", "Pandas", "NumPy", "Scikit-learn",
    "Linux", "Bsh", "PowerBI", "Tableau", "Hadoop", "Spark", "Kafka", "Redis",
    "GraphQL", "REST API", "Microservices", "Swift", "Kotlin", "Flutter", "React Native",
    "Figma", "Adobe XD", "JIRA", "Agile", "Scrum"
]

# Formatting helper: simple tokenizer that separates punctuation
def robust_tokenize(text):
    # Split by space, but also split out punctuation .,!?
    # Add spaces around punctuation then split
    text = re.sub(r'([.,!?()])', r' \1 ', text)
    return [t for t in text.split() if t]

# Template System
# To allow accurate tagging, we won't use .format() on the whole string.
# Instead, acceptable template parts are tokens or {key}.
# We will construct the sentence token by token.

class TemplateGenerator:
    def __init__(self):
        self.templates = [
            # Basic Bio
            ["I", "studied", "at", "{uni}", "."],
            ["I", "graduated", "from", "{uni}", "with", "a", "degree", "in", "{degree}", "."],
            ["Currently", "working", "as", "a", "{job}", "at", "{company}", "."],
            ["I", "am", "a", "{job}", "at", "{company}", "in", "{loc}", "."],
            ["{name}", "works", "at", "{company}", "as", "a", "{job}", "."],
            ["{name}", "lives", "in", "{loc}", "."],
            ["I", "completed", "my", "{degree}", "at", "{uni}", "."],
            ["Meet", "{name}", ",", "a", "{job}", "from", "{loc}", "."],
            ["I", "joined", "{company}", "after", "graduating", "from", "{uni}", "."],
            ["My", "name", "is", "{name}", "and", "I", "am", "from", "{loc}", "."],
            ["{name}", "is", "a", "{job}", "at", "{company}", "."],
            ["Studied", "{degree}", "at", "{uni}", "and", "now", "working", "at", "{company}", "."],
            ["I", "am", "currently", "employed", "at", "{company}", "."],
            ["He", "works", "for", "{company}", "in", "{loc}", "as", "a", "{job}", "."],
            ["She", "is", "a", "student", "at", "{uni}", "."],
            
            # Skill based
            ["I", "am", "proficient", "in", "{skill}", "and", "{skill}", "."],
            ["Skilled", "in", "{skill}", ",", "{skill}", ",", "and", "{skill}", "."],
            ["I", "have", "experience", "with", "{skill}", "and", "{skill}", "stack", "."],
            ["My", "tech", "stack", "include", "{skill}", ",", "{skill}", "and", "{skill}", "."],
            ["Expert", "in", "{skill}", "development", "."],
            ["Working", "with", "{skill}", "at", "{company}", "."],
            ["I", "use", "{skill}", "and", "{skill}", "for", "backend", "development", "."],
            ["Experienced", "{job}", "with", "strong", "knowledge", "of", "{skill}", "."],
            ["Looking", "for", "roles", "irvolving", "{skill}", "and", "{skill}", "."],
            ["Certified", "in", "{skill}", "and", "{skill}", "."],
            ["{name}", "is", "an", "expert", "in", "{skill}", "."],
            ["As", "a", "{job}", ",", "I", "use", "{skill}", "daily", "."]
        ]

    def get_entity(self, key):
        if key == "{name}":
            fn = random.choice(first_names)
            ln = random.choice(last_names)
            # 80% chance full name
            return (f"{fn} {ln}" if random.random() < 0.8 else fn), "PER"
        elif key == "{uni}":
            return random.choice(universities), "ORG"
        elif key == "{company}":
            return random.choice(companies), "ORG"
        elif key == "{loc}":
            return random.choice(locations), "LOC"
        elif key == "{job}":
            return random.choice(jobs), "O" 
        elif key == "{degree}":
            return random.choice(degrees), "O"
        elif key == "{skill}":
            return random.choice(skills), "SKILL"
        return key, "O"

    def generate(self, start_id):
        template = random.choice(self.templates)
        final_tokens = []
        final_tags = []

        # We process the template list. Each item is either a word or a {placeholder}
        # If it's a placeholder, we get the value and split it into tokens if multi-word.
        
        # To avoid repeating skills in one sentence (e.g. "Java and Java"), we track used.
        used_values = set()

        for token in template:
            if token.startswith("{") and token.endswith("}"):
                val, ent_type = self.get_entity(token)
                
                # Retry if duplicate skill in same sentence
                if ent_type == "SKILL":
                    for _ in range(5):
                        if val not in used_values:
                            break
                        val, _ = self.get_entity(token)
                    used_values.add(val)
                
                # Tokenize the entity value (e.g. "University of Colombo")
                # We need to preserve B- / I- structure
                sub_tokens = robust_tokenize(val)
                
                for i, st in enumerate(sub_tokens):
                    final_tokens.append(st)
                    if ent_type == "PER":
                        final_tags.append(TAG_B_PER if i == 0 else TAG_I_PER)
                    elif ent_type == "ORG":
                        final_tags.append(TAG_B_ORG if i == 0 else TAG_I_ORG)
                    elif ent_type == "LOC":
                        final_tags.append(TAG_B_LOC if i == 0 else TAG_I_LOC)
                    elif ent_type == "SKILL":
                        final_tags.append(TAG_B_SKILL if i == 0 else TAG_I_SKILL)
                    else:
                        final_tags.append(TAG_O)
            else:
                # Regular word or punctuation
                final_tokens.append(token)
                final_tags.append(TAG_O)
        
        return {
            "id": str(start_id),
            "tokens": final_tokens,
            "ner_tags": final_tags
        }

def main():
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    else:
        data = []
    
    # Validation: Ensure first 5000 are clean or just take them
    if len(data) > 5000:
        print("Trimming data back to 5000 original entries.")
        data = data[:5000]
    
    gen = TemplateGenerator()
    new_entries = []
    start_id = 5000
    
    # Generate 3000 entries now to add more volume for skills
    for i in range(3000):
        new_entries.append(gen.generate(start_id + i))
        
    data.extend(new_entries)
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write("[\n")
        count = len(data)
        for i, item in enumerate(data):
            f.write("  {\n")
            f.write(f'    "id": "{item["id"]}",\n')
            tokens_str = json.dumps(item["tokens"], ensure_ascii=False)
            f.write(f'    "tokens": {tokens_str},\n')
            ner_tags_str = json.dumps(item["ner_tags"], ensure_ascii=False)
            if i < count - 1:
                f.write(f'    "ner_tags": {ner_tags_str}\n  }},\n')
            else:
                f.write(f'    "ner_tags": {ner_tags_str}\n  }}\n')
        f.write("]\n")

    print(f"Done. Total entries: {len(data)}")

if __name__ == "__main__":
    main()
