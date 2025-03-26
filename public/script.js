document.addEventListener("DOMContentLoaded", async () => {
    const emailList = document.getElementById("email-list");
    const emailDetails = document.getElementById("email-details");
    const senderElem = document.getElementById("email-sender");
    const subjectElem = document.getElementById("email-subject");
    const bodyElem = document.getElementById("email-body");
    const feedbackElem = document.getElementById("feedback");
    let selectedEmailId = null;

    // Fetch emails from backend
    async function loadEmails() {
        try {
            const response = await fetch("/api/emails");
            const emails = await response.json();
            emailList.innerHTML = "";

            emails.forEach(email => {
                const emailItem = document.createElement("p");
                emailItem.textContent = `From: ${email.sender} | Subject: ${email.subject}`;
                emailItem.classList.add("email-item");
                emailItem.onclick = () => showEmail(email);
                emailList.appendChild(emailItem);
            });
        } catch (error) {
            console.error("Error loading emails:", error);
            emailList.innerHTML = "<p>Failed to load emails.</p>";
        }
    }

    // Show email details
    function showEmail(email) {
        selectedEmailId = email.id;
        senderElem.textContent = email.sender;
        subjectElem.textContent = email.subject;
        bodyElem.textContent = email.body;
        emailDetails.classList.remove("hidden");
    }

    // Handle user choice
    async function submitChoice(isPhishing) {
        if (!selectedEmailId) return;
        try {
            const response = await fetch("/api/check-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ emailId: selectedEmailId, userChoice: isPhishing })
            });

            const result = await response.json();
            feedbackElem.textContent = result.message;
            loadEmails(); // Refresh emails
        } catch (error) {
            console.error("Error submitting choice:", error);
        }
    }

    loadEmails();
});
