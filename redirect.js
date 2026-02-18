// Sign-Up Form Logic
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const name = document.getElementById("name").value;
  const role = document.getElementById("role").value; // 'student' or 'driver'

  try {
    const response = await fetch("http://localhost:5501/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, role }),
    });

    const data = await response.json();
    if (response.ok) {
      alert("Sign-up successful! Redirecting to login...");
      window.location.href = "login.html";
    } else {
      alert(data.message);
    }
  } catch (error) {
    alert("An error occurred during sign-up.");
  }
});

// Login Form Logic
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:5501/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      if (data.role === "student") {
        window.location.href = "studentDashboard.html";
      } else if (data.role === "driver") {
        window.location.href = "driverDashboard.html";
      }
    } else {
      alert(data.message);
    }
  } catch (error) {
    alert("An error occurred during login.");
  }
});
