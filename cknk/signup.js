// JavaScript for handling the sign-up form
document.getElementById("signup-form").addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission
  
    // Gather input values
    const fullName = document.getElementById("full-name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const allergyInfo = document.getElementById("allergy-info").value.trim();
  
    // Preferred food components
    const preferences = [];
    document.querySelectorAll(".checkbox-group input:checked").forEach((checkbox) => {
      preferences.push(checkbox.value);
    });
  
    // Basic validation
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
  
    // Prepare data to send
    const userData = {
      fullName,
      email,
      password,
      allergyInfo,
      preferences,
    };
  
    try {
      // Send data to your API endpoint
      const response = await fetch("https://localhost:5000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
  
      if (response.ok) {
        alert("Sign-up successful! You can now log in.");
        window.location.href = "login.html"; // Redirect to login page
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (err) {
      console.error("Sign-up error:", err);
      alert("Something went wrong. Please try again later.");
    }
  });
  