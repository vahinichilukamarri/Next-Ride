document.getElementById("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      const role = data.role;

      if (role === "student") {
        window.location.href = "student_dashboard.html";
      } else if (role === "driver") {
        window.location.href = "driver_dashboard.html";
      } else {
        alert("Unknown role. Please contact support.");
      }
    } else {
      const errorData = await response.json();
      alert(errorData.message || "Login failed.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while logging in.");
  }
});
