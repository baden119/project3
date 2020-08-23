document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#display-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  document.querySelector('#compose-form').onsubmit = () => {

    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
    })
    load_mailbox('sent')
    return false;
  };
}


function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#display-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // ... do something else with emails ...
      emails.forEach(email => list_emails(email));
  });

  // List all emails in a mailbox
  function list_emails(email){
    // Create new mailbox item
    const mailbox_item = document.createElement('div');

    // Mailbox items have diffrent background colors depending on if they've been read.
    if (email.read == false){
      mailbox_item.className = 'mailbox_item_unread';
    }
    else{
      mailbox_item.className = 'mailbox_item_read';
    }
    // Text for the mailbox item from email data
    mailbox_item.innerHTML = `<strong>${email.sender}</strong> \u00A0\u00A0\u00A0\u00A0${email.subject} <span style="float:right;">${email.timestamp}</span>`;

    // Clicking on a mailbox item displays that email
    mailbox_item.addEventListener('click', function() {
      fetch(`/emails/${email.id}`)
      .then(response => response.json())
      .then(email => {display_email(email)});
    });

    // Add mailbox item to DOM
    document.querySelector('#emails-view').append(mailbox_item)
  };
} // function (load_mailbox)

// View an email
function display_email(email){
  // Show the display email view and hide all other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#display-view').style.display = 'block';

  // Populate HTML fields with email data
  document.querySelector('#from-field').innerHTML = `<strong>From:\u00A0</strong>${email.sender}`;
  document.querySelector('#to-field').innerHTML = `<strong>To:\u00A0</strong>${email.recipients}`;
  document.querySelector('#subject-field').innerHTML = `<strong>Subject:\u00A0</strong>${email.subject}`;
  document.querySelector('#timestamp-field').innerHTML = `<strong>Timestamp:\u00A0</strong>${email.timestamp}`;
  document.querySelector('#email-body-field').innerHTML = `${email.body}`;

  // Mark email as having been read
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
    read: true
    })
  })
};
