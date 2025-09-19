document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("regForm");
  const submitBtn =
    document.getElementById("submitBtn") ||
    form.querySelector('button[type="submit"]');
  const formMessage = document.getElementById("formMessage");

  const inputs = {
    fullName: document.getElementById("fullName"),
    email: document.getElementById("email"),
    phone: document.getElementById("phone"),
    password: document.getElementById("password"),
    confirmPassword: document.getElementById("confirmPassword"),
  };

  function findFeedbackEl(input) {
    if (!input) return null;
    if (
      input.nextElementSibling &&
      input.nextElementSibling.classList.contains("invalid-feedback")
    )
      return input.nextElementSibling;
    const parent = input.parentElement;
    if (parent) {
      const feedback = parent.querySelector(".invalid-feedback");
      if (feedback) return feedback;
    }
    const row = input.closest(".form-row");
    if (row) {
      const feedback = row.querySelector(".invalid-feedback");
      if (feedback) return feedback;
    }
    return null;
  }

  function showError(input, message) {
    const row = input.closest(".form-row") || input.parentElement;
    const fb = findFeedbackEl(input);
    input.classList.add("is-invalid");
    if (row) row.classList.add("invalid");
    if (fb) {
      fb.textContent = message;
      fb.style.display = "block";
    }
  }

  function clearError(input) {
    const row = input.closest(".form-row") || input.parentElement;
    const fb = findFeedbackEl(input);
    input.classList.remove("is-invalid");
    if (row) row.classList.remove("invalid");
    if (fb) {
      fb.textContent = fb.getAttribute("data-default") || "";
      fb.style.display = "";
    }
  }

  Object.values(inputs).forEach((inp) => {
    const fb = findFeedbackEl(inp);
    if (fb && !fb.getAttribute("data-default"))
      fb.setAttribute("data-default", fb.textContent.trim());
  });

  function isEmpty(value) {
    return !value || value.trim().length === 0;
  }

  function validateEmail(email) {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  }

  function validatePhone(phone) {
    if (!/^\d{10}$/.test(phone)) return false;
    if (phone === "1234567890") return false;
    return true;
  }

  function passwordContainsRestricted(password, fullName, email) {
    const lower = (password || "").toLowerCase();
    if (lower.includes("password")) return true;
    if (fullName && fullName.trim()) {
      const parts = fullName.toLowerCase().split(/\s+/).filter(Boolean);
      for (const p of parts) {
        if (p.length >= 3 && lower.includes(p)) return true;
      }
    }
    if (email && email.includes("@")) {
      const local = email.split("@")[0].toLowerCase();
      if (local.length >= 3 && lower.includes(local)) return true;
    }
    return false;
  }

  Object.values(inputs).forEach((input) => {
    input.addEventListener("input", () => {
      clearError(input);
      formMessage.textContent = "";
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    formMessage.textContent = "";
    formMessage.style.color = "";
    Object.values(inputs).forEach(clearError);

    const values = {
      fullName: inputs.fullName.value.trim(),
      email: inputs.email.value.trim(),
      phone: inputs.phone.value.trim(),
      password: inputs.password.value,
      confirmPassword: inputs.confirmPassword.value,
    };

    let hasError = false;

    if (isEmpty(values.fullName)) {
      showError(inputs.fullName, "Full name is required.");
      hasError = true;
    }

    if (isEmpty(values.email)) {
      showError(inputs.email, "Email address is required.");
      hasError = true;
    } else if (!validateEmail(values.email)) {
      showError(
        inputs.email,
        "Please enter a valid email (example: you@example.com)."
      );
      hasError = true;
    }

    if (isEmpty(values.phone)) {
      showError(inputs.phone, "Phone number is required.");
      hasError = true;
    } else if (!validatePhone(values.phone)) {
      showError(
        inputs.phone,
        "Enter a valid 10-digit phone number (not 1234567890)."
      );
      hasError = true;
    }

    if (isEmpty(values.password)) {
      showError(inputs.password, "Password is required.");
      hasError = true;
    } else if (values.password.length < 8) {
      showError(inputs.password, "Password must be at least 8 characters.");
      hasError = true;
    } else if (
      passwordContainsRestricted(values.password, values.fullName, values.email)
    ) {
      showError(
        inputs.password,
        'Password cannot contain "password", your name, or email username.'
      );
      hasError = true;
    }

    if (isEmpty(values.confirmPassword)) {
      showError(inputs.confirmPassword, "Please confirm your password.");
      hasError = true;
    } else if (values.password !== values.confirmPassword) {
      showError(inputs.confirmPassword, "Passwords do not match.");
      hasError = true;
    }

    if (hasError) {
      formMessage.textContent =
        "Please fill the highlighted fields and try again.";
      formMessage.style.color = "#dc2626";
      formMessage.setAttribute("aria-live", "polite");
      return;
    }

    submitBtn.setAttribute("disabled", "true");
    const originalText =
      submitBtn.querySelector(".btn-text")?.textContent ||
      submitBtn.textContent;
    if (submitBtn.querySelector(".btn-text"))
      submitBtn.querySelector(".btn-text").textContent = "Sending…";
    submitBtn.classList.add("sending");
    formMessage.textContent = "Sending message...";
    formMessage.style.color = "";

    setTimeout(() => {
      submitBtn.removeAttribute("disabled");
      if (submitBtn.querySelector(".btn-text"))
        submitBtn.querySelector(".btn-text").textContent = originalText.trim();
      submitBtn.classList.remove("sending");
      formMessage.textContent =
        "Message sent — thank you! We will get back to you soon.";
      formMessage.style.color = "#16a34a";
      form.reset();
      Object.values(inputs).forEach(clearError);
    }, 900);
  });
});
