"""
Test script for Attendo API
Run this after starting the server to test all endpoints
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("\n=== Testing Health Endpoint ===")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

def test_send_otp_student_registration():
    """Test sending OTP for student registration"""
    print("\n=== Testing Send OTP (Student Registration) ===")
    data = {
        "email": "cs24b1027@iiitr.ac.in",
        "user_type": "student",
        "purpose": "registration"
    }
    response = requests.post(f"{BASE_URL}/api/auth/send-otp", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

def test_send_otp_faculty_registration():
    """Test sending OTP for faculty registration"""
    print("\n=== Testing Send OTP (Faculty Registration) ===")
    data = {
        "email": "faculty@iiitr.ac.in",
        "user_type": "faculty",
        "purpose": "registration"
    }
    response = requests.post(f"{BASE_URL}/api/auth/send-otp", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

def test_verify_otp():
    """Test OTP verification"""
    print("\n=== Testing Verify OTP ===")
    otp = input("Enter the OTP received in email: ")
    data = {
        "email": "cs24b1027@iiitr.ac.in",
        "otp_code": otp,
        "user_type": "student"
    }
    response = requests.post(f"{BASE_URL}/api/auth/verify-otp", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

def test_register_faculty():
    """Test faculty registration"""
    print("\n=== Testing Faculty Registration ===")
    data = {
        "name": "Dr. John Smith",
        "faculty_id": "FAC001",
        "email": "faculty@iiitr.ac.in",
        "department": "Computer Science",
        "designation": "Professor"
    }
    response = requests.post(f"{BASE_URL}/api/auth/faculty/register", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

def test_invalid_email():
    """Test invalid email validation"""
    print("\n=== Testing Invalid Email ===")
    data = {
        "email": "invalid@gmail.com",
        "user_type": "student",
        "purpose": "registration"
    }
    response = requests.post(f"{BASE_URL}/api/auth/send-otp", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 422  # Should fail validation

def test_login_unregistered():
    """Test login with unregistered email"""
    print("\n=== Testing Login with Unregistered Email ===")
    data = {
        "email": "unregistered@iiitr.ac.in",
        "user_type": "student",
        "purpose": "login"
    }
    response = requests.post(f"{BASE_URL}/api/auth/send-otp", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 404  # Should fail - not found

def run_all_tests():
    """Run all tests"""
    print("\n" + "="*50)
    print("ATTENDO API TEST SUITE")
    print("="*50)
    
    tests = [
        ("Health Check", test_health),
        ("Send OTP - Student Registration", test_send_otp_student_registration),
        ("Invalid Email", test_invalid_email),
        ("Login Unregistered", test_login_unregistered),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, "✅ PASSED" if result else "❌ FAILED"))
        except Exception as e:
            results.append((test_name, f"❌ ERROR: {str(e)}"))
    
    # Print summary
    print("\n" + "="*50)
    print("TEST RESULTS SUMMARY")
    print("="*50)
    for test_name, result in results:
        print(f"{test_name}: {result}")
    
    # Interactive tests that require user input
    print("\n" + "="*50)
    print("INTERACTIVE TESTS")
    print("="*50)
    
    choice = input("\nDo you want to test OTP verification? (y/n): ")
    if choice.lower() == 'y':
        test_verify_otp()
    
    choice = input("\nDo you want to test faculty registration? (y/n): ")
    if choice.lower() == 'y':
        test_send_otp_faculty_registration()
        input("\nCheck your email and press Enter to continue...")
        test_register_faculty()

if __name__ == "__main__":
    print("Make sure the server is running at http://localhost:8000")
    input("Press Enter to continue...")
    run_all_tests()