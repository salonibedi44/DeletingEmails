

function startTypingEffect(elements) {
    if (localStorage.getItem("returnFromAuthenticate")) {

        elements.forEach(element => {
            const string_id = element[1];
            const text = element[2];
            const dom_element = document.getElementById(string_id);
            dom_element.textContent = text;


        });
        localStorage.setItem("returnFromAuthenticate", "");
        const authenticateContainer = document.querySelector(".step-1-container");
        const inputContainer = document.querySelector(".step-2-container");
        document.getElementById("authenticationButton").classList.remove('visible');
        document.getElementById("emailInput").classList.add('visible');
        authenticateContainer.style.opacity = 0.3;
        inputContainer.style.opacity = 1;
        inputContainer.classList.add('visible');
        return;
    }

    elements.forEach(element => {
        var text_idx = 0;
        function typeNextLetter(element) {
            const int_id = element[0]
            const string_id = element[1];
            const text = element[2];
            const typingSpeed = element[3];

            const dom_element = document.getElementById(string_id);
        
            if (text_idx < text.length) {
                dom_element.textContent += text.charAt(text_idx);
                text_idx++;
                setTimeout(() => typeNextLetter(element), typingSpeed);
            } else {
                // Reset index for next element
                const start_typing_next_elt_trigger = new CustomEvent("typingDoneForElement" + int_id);
                document.dispatchEvent(start_typing_next_elt_trigger);
                console.log(start_typing_next_elt_trigger);
            }
        }

        element_int_id = element[0];

        if (element_int_id > 0) {
            document.addEventListener("typingDoneForElement" + (element_int_id - 1), () => typeNextLetter(element));
        } else {
            typeNextLetter(element);
        }
    });

    document.addEventListener("typingDoneForElement" + (elements.length - 1), () => {
        document.dispatchEvent(new CustomEvent("typingDone"))
    });
}

function fadeButtonsIn() {
    const subtitle = document.getElementById("subtitle");
    const authenticateContainer = document.querySelector(".step-1-container");
    const inputContainer = document.querySelector(".step-2-container");

    if (! subtitle || !authenticateContainer || !inputContainer) {
        console.error("Container elements not found!");
        return;
    }
    document.getElementById("authenticationButton").classList.add('visible');
    authenticateContainer.style.opacity = 1;
    document.getElementById("emailInput").classList.remove('visible');
    inputContainer.style.opacity = 0.3;
}

const typingData = [
    [0, "title", "Clear your inbox", 100],
    [1, "subtitle", "Quickly log in and clean up your inbox in seconds.", 30]
];

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    startTypingEffect(typingData)
});
document.addEventListener('typingDone', fadeButtonsIn);