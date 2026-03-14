// Navigation toggle
const navToggle = document.querySelector(".nav-toggle");
const primaryNav = document.querySelector(".primary-nav");

if (navToggle && primaryNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = primaryNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

// Smooth scroll for buttons with data-scroll-target
document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const scrollTarget = target.getAttribute("data-scroll-target");
  if (scrollTarget) {
    event.preventDefault();

    const el = document.querySelector(scrollTarget);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // If a service choice is provided, pre-select it in the unified form
    const choice = target.getAttribute("data-service-choice");
    if (choice) {
      const serviceSelect = document.querySelector(
        "#lead-form select[name='preferredService']"
      );
      if (serviceSelect instanceof HTMLSelectElement) {
        serviceSelect.value = choice;
      }
    }
  }
});

// Testimonial slider
const testimonials = Array.from(document.querySelectorAll(".testimonial"));
const dots = Array.from(document.querySelectorAll(".slider-dot"));

function setSlide(index) {
  testimonials.forEach((t, i) => {
    t.classList.toggle("active", i === index);
  });
  dots.forEach((d, i) => {
    d.classList.toggle("active", i === index);
  });
}

dots.forEach((dot) => {
  dot.addEventListener("click", () => {
    const slideIndex = Number(dot.dataset.slide ?? "0");
    setSlide(slideIndex);
  });
});

// Simple auto-rotate every 8s, pauses on manual click
let sliderIndex = 0;
let sliderTimer = setInterval(() => {
  if (testimonials.length === 0) return;
  sliderIndex = (sliderIndex + 1) % testimonials.length;
  setSlide(sliderIndex);
}, 8000);

dots.forEach((dot) => {
  dot.addEventListener("click", () => {
    clearInterval(sliderTimer);
  });
});

// Year in footer
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = String(new Date().getFullYear());
}

// Analytics hooks (Google Analytics, GTM, Facebook, LinkedIn)
function trackConversion(service, source) {
  const payload = {
    service,
    source: source || "landing-page",
    timestamp: new Date().toISOString()
  };

  // Google Analytics 4 example
  if (typeof window.gtag === "function") {
    window.gtag("event", "lead_submitted", {
      event_category: "Lead",
      event_label: service,
      ...payload
    });
  }

  // Google Tag Manager dataLayer example
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: "leadSubmitted",
      ...payload
    });
  }

  // Facebook Pixel / LinkedIn Insight placeholder hooks
  if (typeof window.fbq === "function") {
    window.fbq("track", "Lead", { content_name: service });
  }
  if (typeof window.lintrk === "function") {
    window.lintrk("track", { conversion_id: "LEAD_SUBMITTED" });
  }
}

// Helper to get UTM params
function getUtmParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get("utm_source") || "";
  const utmMedium = urlParams.get("utm_medium") || "";
  const utmCampaign = urlParams.get("utm_campaign") || "";
  return { utmSource, utmMedium, utmCampaign };
}

// API URL configuration - uses Render backend on GitHub Pages, localhost for development
const API_BASE_URL = window.location.hostname.includes('github.io') 
  ? 'https://campus-career-api.onrender.com' 
  : '';

window.CAMPUS_CAREER_API_URL = API_BASE_URL + '/api/leads';

// Generic API submission to backend
async function submitLeadForm(form, service) {
  const formData = new FormData(form);
  const { utmSource, utmMedium, utmCampaign } = getUtmParams();

  if (!formData.get("utmSource")) {
    formData.set("utmSource", utmSource);
  }
  formData.set("utmMedium", utmMedium);
  formData.set("utmCampaign", utmCampaign);

  const data = Object.fromEntries(formData.entries());

  const apiUrl = window.CAMPUS_CAREER_API_URL || "/api/leads";

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  const result = await response.json();
  
  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to submit form");
  }
  
  return result;
}

// Newsletter subscription to backend
async function subscribeNewsletter(email) {
  const apiUrl = API_BASE_URL + "/api/subscribe";

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email })
  });

  const result = await response.json();
  
  if (!response.ok && !result.success) {
    throw new Error(result.message || "Failed to subscribe");
  }
  
  return result;
}

// Client-side validation
function validateField(input) {
  const fieldWrapper = input.closest(".form-field");
  const errorEl = fieldWrapper?.querySelector(".field-error");
  let message = "";

  if (input.hasAttribute("required") && !input.value.trim()) {
    message = "This field is required.";
  } else if (input.type === "email" && input.value) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(input.value)) {
      message = "Please enter a valid email address.";
    }
  } else if (input.type === "tel" && input.value) {
    const telPattern = /^[0-9+\-\s]{8,15}$/;
    if (!telPattern.test(input.value)) {
      message = "Please enter a valid phone number.";
    }
  } else if (input.tagName === "SELECT" && input.hasAttribute("required")) {
    if (!input.value) {
      message = "Please select an option.";
    }
  }

  if (message) {
    input.setAttribute("aria-invalid", "true");
  } else {
    input.removeAttribute("aria-invalid");
  }

  if (errorEl) {
    errorEl.textContent = message;
  }

  return !message;
}

function setupForm(form) {
  const fallbackService = form.dataset.service || "Unknown";
  const successEl = form.querySelector(".form-success");
  const errorEl = form.querySelector(".form-error");

  Array.from(
    form.querySelectorAll("input[required], select[required], textarea[required]")
  ).forEach((input) => {
    input.addEventListener("blur", () => validateField(input));
    input.addEventListener("input", () => validateField(input));
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (successEl) successEl.textContent = "";
    if (errorEl) errorEl.textContent = "";

    // Validate all fields
    const fields = Array.from(
      form.querySelectorAll("input, select, textarea")
    );
    let isValid = true;
    fields.forEach((input) => {
      if (input.hasAttribute("required")) {
        const fieldValid = validateField(input);
        if (!fieldValid) {
          isValid = false;
        }
      }
    });
    if (!isValid) {
      if (errorEl) {
        errorEl.textContent = "Please fix the highlighted fields and try again.";
      }
      return;
    }

    const nameInput = form.querySelector("input[name='fullName']");
    const name =
      nameInput && nameInput instanceof HTMLInputElement && nameInput.value
        ? nameInput.value
        : "there";

    const preferredServiceField =
      form.querySelector("select[name='preferredService']") ||
      form.querySelector("input[name='preferredService']");
    const preferredService =
      preferredServiceField &&
      preferredServiceField instanceof HTMLInputElement
        ? preferredServiceField.value
        : preferredServiceField && preferredServiceField instanceof HTMLSelectElement
        ? preferredServiceField.value
        : fallbackService;

    try {
      await submitLeadForm(form, preferredService);
      trackConversion(preferredService, "landing-page");

      if (successEl) {
        successEl.textContent = `Thanks, ${name}! We've received your request. Expect an email and a WhatsApp message within 24 hours.`;
      }

      form.reset();
    } catch (error) {
      if (errorEl) {
        errorEl.textContent =
          "Something went wrong while submitting. Please try again in a moment.";
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const leadForms = document.querySelectorAll(".lead-form");
  leadForms.forEach((form) => {
    if (form instanceof HTMLFormElement) {
      setupForm(form);
    }
  });

  const newsletterForm = document.querySelector(".newsletter-form");
  if (newsletterForm instanceof HTMLFormElement) {
    const successEl = newsletterForm.querySelector(".form-success");
    const errorEl = newsletterForm.querySelector(".form-error");
    const emailInput = newsletterForm.querySelector("input[type='email']");

    newsletterForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!(emailInput instanceof HTMLInputElement)) return;
      if (successEl) successEl.textContent = "";
      if (errorEl) errorEl.textContent = "";

      if (!emailInput.value.trim()) {
        if (errorEl) {
          errorEl.textContent = "Please enter your email.";
        }
        return;
      }

      try {
        const result = await subscribeNewsletter(emailInput.value.trim());
        if (successEl) {
          successEl.textContent = result.message || 
            "Thanks for subscribing! Check your inbox for our next newsletter.";
        }
        newsletterForm.reset();
      } catch (error) {
        if (errorEl) {
          errorEl.textContent = error.message || 
            "Something went wrong. Please try again.";
        }
      }
    });
  }
});

