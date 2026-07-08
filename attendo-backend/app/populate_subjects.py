"""
Populate subjects in database for all branches and semesters.
Idempotent: safe to run on every container startup.
Automatically skips if subjects already exist — no manual step needed.
"""

from app.database import SessionLocal
from app.models import Subject

def populate_subjects():
    db = SessionLocal()

    try:
        # Check if subjects already exist — skip silently if so (no input() prompt,
        # since containers have no TTY and would hang forever waiting for input)
        existing = db.query(Subject).count()
        if existing > 0:
            print(f"Subjects already populated ({existing} rows). Skipping.")
            return

        subjects_data = []

        # ------------------------------
        # 1) CS SUBJECTS
        # ------------------------------
        cs_subjects = {
            "1st Semester": [
                ("MA101", "Mathematics I"),
                ("ID110", "Introduction to Programming"),
                ("ID120", "Digital Fabrication"),
                ("ID130", "Digital Logic Design"),
                ("ID131", "Digital Systems Design"),
                ("ID141", "Introduction to AI & DS"),
                ("CS101", "Introduction to Computer Science"),
                ("LAxxx", "LA elective"),
                ("CAxxx", "CA elective"),
            ],
            "2nd Semester": [
                ("MA102", "Mathematics II"),
                ("BO121", "Introduction to Life Sciences"),
                ("EE121", "Hardware Description Language"),
                ("CS121", "Discrete Structures"),
                ("CS122", "Introduction to Object Oriented Programming"),
                ("ID151", "Independent Project"),
                ("ID161", "Professional Communication Skills and Writing"),
            ],
            "3rd Semester": [
                ("MA201", "Probability, Statistics & Random Processes"),
                ("CS201", "Data Structures"),
                ("CS202", "Theory of Computation"),
                ("CS210", "Software Engineering"),
                ("CS241", "Computer Architecture"),
                ("CS231", "Python Programming"),
                ("LAxxx", "LA elective"),
            ],
            "4th Semester": [
                ("CS251", "Design and Analysis of Algorithms"),
                ("CS221/CS222", "Operating Systems Theory / Lab"),
                ("CS232", "Compiler and Programming Language"),
                ("CS261", "DBMS"),
                ("XXxxx", "Engineering Elective"),
                ("LAxxx", "LA elective"),
            ],
            "5th Semester": [
                ("CS301", "Computer Networks"),
                ("CS311", "Foundations of Machine Learning"),
                ("CSxxx", "CS Elective 1"),
                ("XXxxx", "Free Elective 1"),
                ("CSxxx", "CS Elective 2"),
                ("ID162/ID163", "Personality Development / Professional Ethics"),
            ],
            "6th Semester": [
                ("CS391", "Mini Project 1"),
                ("CSxxx", "CS Elective 3"),
                ("CSxxx", "CS Elective 4"),
                ("XXxxx", "Free Elective 2"),
                ("XXxxx", "Science Elective"),
            ],
            "7th Semester": [
                ("CS491/CSxxx", "(Mini Project 2/CS Elective 5) / (Mini Project 1/CS Elective 3)"),
                ("CSxxx/CSxxx", "CS Elective 6 / CS Elective 4"),
                ("CSxxx/CSxxx", "CS Elective 7 / CS Elective 5"),
                ("XXxxx/CSxxx", "Free Elective 3 / CS Elective 6"),
                ("XXxxx/XXxxx", "Free Elective 4 / Free Elective 2"),
            ],
            "8th Semester": [
                ("CSxxx", "Major Project"),
                ("XXxxx", "Free Elective 3"),
                ("CSxxx", "CS Elective 7"),
                ("XXxxx", "Science Elective"),
            ],
        }

        # ------------------------------
        # 2) AI & DS SUBJECTS
        # ------------------------------
        ad_subjects = {
            "1st Semester": [
                ("MA101", "Mathematics I"),
                ("ID110", "Introduction to Programming"),
                ("ID120", "Digital Fabrication"),
                ("ID130", "Digital Logic Design"),
                ("ID131", "Digital Systems Design"),
                ("ID141", "Introduction to AI & DS"),
                ("CS101", "Introduction to Computer Science"),
                ("LAxxx", "LA elective"),
                ("CAxxx", "CA elective"),
            ],
            "2nd Semester": [
                ("MA102", "Mathematics II"),
                ("BO121", "Introduction to Life Sciences"),
                ("EE121", "Hardware Description Language"),
                ("CS121", "Discrete Structures"),
                ("CS122", "Introduction to Object Oriented Programming"),
                ("ID151", "Independent Project"),
                ("ID161", "Professional Communication Skills and Writing"),
            ],
            "3rd Semester": [
                ("MA201", "Introduction to Probability, Statistics & Random Processes"),
                ("CS201", "Data Structures"),
                ("ADXXX", "Python Programming for AI & DS"),
                ("CS210", "Software Engineering"),
                ("CS241", "Computer Architecture"),
                ("CS231", "Introduction to Python Programming"),
                ("LAxxx", "LA Elective"),
            ],
            "4th Semester": [
                ("CS251", "Design and Analysis of Algorithms"),
                ("CSXXX", "Operating Systems"),
                ("ADXX", "Data Warehousing and Data Mining"),
                ("CS261", "DBMS"),
                ("XXxxx", "Engineering Elective"),
                ("LAxxx", "LA Elective"),
                ("MAXX", "Linear Algebra & Matrix Theory"),
            ],
            "5th Semester": [
                ("CS301", "Computer Networks"),
                ("ADXX", "Artificial Intelligence"),
                ("ADXX", "Machine Learning & Data Science"),
                ("ADxxx", "AD Elective 1"),
                ("XXxxx", "Free Elective 1"),
                ("ID162/ID163", "Personality Development / Professional Ethics"),
            ],
            "6th Semester": [
                ("AD391", "Mini Project 1"),
                ("ADxxx", "AD Elective 3"),
                ("ADxxx", "AD Elective 4"),
                ("XXxxx", "Free Elective 2"),
                ("XXxxx", "Science Elective"),
            ],
            "7th Semester": [
                ("AD491/ADxxx", "(Mini Project 2/AD Elective 4) / (Mini Project 1/AD Elective 2)"),
                ("ADxxx/ADxxx", "AD Elective 5 / AD Elective 3"),
                ("ADxxx/ADxxx", "AD Elective 6 / AD Elective 4"),
                ("XXxxx/ADxxx", "Free Elective 3 / AD Elective 5"),
                ("XXxxx/XXxxx", "Free Elective 4 / Free Elective 2"),
            ],
            "8th Semester": [
                ("ADxxx", "Major Project"),
                ("XXxxx", "Free Elective 3"),
                ("ADxxx", "AD Elective 6"),
                ("XXxxx", "Science Elective"),
            ],
        }

        # ------------------------------
        # 3) MATHEMATICS & COMPUTING
        # ------------------------------
        mc_subjects = {
            "1st Semester": [
                ("MA101", "Mathematics I"),
                ("ID110", "Introduction to Programming"),
                ("ID120", "Digital Fabrication"),
                ("ID130", "Digital Logic Design"),
                ("ID131", "Digital Systems Design"),
                ("CS101", "Introduction to Computer Science"),
                ("LAxxx", "LA Elective"),
                ("CAxxx", "CA Elective"),
            ],
            "2nd Semester": [
                ("MA102", "Mathematics II"),
                ("BO121", "Introduction to Life Sciences"),
                ("EE121", "Hardware Description Language"),
                ("CS121", "Discrete Mathematics"),
                ("CS122", "Object Oriented Programming"),
                ("ID151", "Independent Project"),
                ("ID161", "Professional Communication Skills & Writing"),
            ],
            "3rd Semester": [
                ("CSxxx", "Formal Languages & Automata Theory"),
                ("CS201", "Data Structures & Applications"),
                ("MCxxx", "Group & Ring Theory"),
                ("MCxxx", "Introduction to Probability & Random Processes"),
                ("MA204", "Number Theory"),
                ("CS231", "Introduction to Python Programming"),
            ],
            "4th Semester": [
                ("MCxxx", "Cryptography and its Applications"),
                ("CS261", "Database Management Systems"),
                ("MCxxx", "Real Analysis & Metric Spaces"),
                ("CS202", "Design and Analysis of Algorithms"),
                ("MCxxx", "Linear Algebra and its Applications"),
                ("MCxxx", "Introduction to Applied Statistics "),
            ],
            "5th Semester": [
                ("MCxxx", "Linear Systems and Signal Processing"),
                ("CSxxx", "Operating Systems I"),
                ("MCxxx", "Combinatorics"),
                ("MCxxx", "Numerical Analysis & Complex Variables"),
                ("XXxxx", "Free Elective 1"),
                ("MCxxx", "Department Elective 1"),
                ("CSxxx", "Introduction to Compilers"),
            ],
            "6th Semester": [
                ("MAxxx", "Numerical Linear Algebra"),
                ("MCxxx", "Department Elective 2"),
                ("XXxxx", "Engineering Elective 1"),
                ("XXxxx", "Free Elective 2"),
                ("LAxxx", "LA/CA Elective"),
                ("MCxxx", "Optimization"),
                ("MCxxx", "Credited Research Project I"),
                ("MCxxx", "Industry Project"),
            ],
            "7th Semester": [
                ("MCxxx", "Functional Analysis"),
                ("MAxxx", "Financial Engineering Mathematics"),
                ("MCxxx", "Department Elective 3"),
                ("MAxxx", "MA Elective"),
                ("XXxxx", "Free Elective 3"),
                ("MCxxx", "Research Project II"),
            ],
            "8th Semester": [
                ("MCxxx", "Major Project"),
            ],
        }

        # ------------------------------
        # Insert All Subjects
        # ------------------------------

        def add_branch(branch_name, subject_map):
            for semester, subjects in subject_map.items():
                for code, name in subjects:
                    subjects_data.append(
                        Subject(
                            subject_code=code,
                            subject_name=name,
                            branch=branch_name,
                            semester=semester,
                        )
                    )

        add_branch("Computer Science & Engineering", cs_subjects)
        add_branch("Artificial Intelligence & Data Science", ad_subjects)
        add_branch("Mathematics & Computing", mc_subjects)

        # Save to DB
        db.add_all(subjects_data)
        db.commit()

        print(f"Added {len(subjects_data)} subjects successfully!")

    except Exception as e:
        db.rollback()
        print(f"Failed to populate subjects: {e}")
        raise

    finally:
        db.close()

if __name__ == "__main__":
    populate_subjects()
