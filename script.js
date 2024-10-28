// PeerSMS Beta1 JavaScript

// Keep all existing code here (do not modify or remove anything)

// ... (all existing code remains unchanged)

// Add these new functions at the end of the file

async function loadTwilioSettings() {
    try {
        const twilioSettings = await apiRequest('/twilio-settings');
        document.getElementById('twilio-account-sid').value = twilioSettings.twilioAccountSid || '';
        document.getElementById('twilio-auth-token').value = twilioSettings.twilioAuthToken || '';
        document.getElementById('twilio-phone-number').value = twilioSettings.twilioPhoneNumber || '';
    } catch (error) {
        console.error('Error loading Twilio settings:', error);
    }
}

async function updateTwilioSettings() {
    const twilioAccountSid = document.getElementById('twilio-account-sid').value;
    const twilioAuthToken = document.getElementById('twilio-auth-token').value;
    const twilioPhoneNumber = document.getElementById('twilio-phone-number').value;

    try {
        await apiRequest('/twilio-settings', 'POST', {
            twilioAccountSid,
            twilioAuthToken,
            twilioPhoneNumber
        });
        alert('Twilio settings updated successfully');
    } catch (error) {
        console.error('Error updating Twilio settings:', error);
        alert('Failed to update Twilio settings');
    }
}

// Call this function after the page loads to populate Twilio settings
document.addEventListener('DOMContentLoaded', function() {
    const existingDOMContentLoaded = document.onDOMContentLoaded;
    if (existingDOMContentLoaded) {
        existingDOMContentLoaded();
    }
    loadTwilioSettings();
});

// Add an event listener to the general settings form to include Twilio settings update
const generalSettingsForm = document.getElementById('general-settings-form');
if (generalSettingsForm) {
    const existingSubmitHandler = generalSettingsForm.onsubmit;
    generalSettingsForm.onsubmit = async function(e) {
        e.preventDefault();
        await updateTwilioSettings();
        if (existingSubmitHandler) {
            existingSubmitHandler.call(this, e);
        }
    };
}