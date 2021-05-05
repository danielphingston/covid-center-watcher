# Covid Center Watch

## Setup and Run

1.  Create .env file with required variables

```SHELL
#email id and password to use to send email
EMAIL=
PASSWORD=

#district to watch
DISTRICT=307

#use for testing
NODE_ENV=test

#url of a google sheet containing email addresses that is published as csv
#just needs to a csv with a new line separating the emails
GOOGLE_SHEET_URL=
```

2.  Run npm install
3.  Run npm start

## Additional info

- Deploy to lambda and use run on a rate limit
- This form is used to add email to the list [Google Form](https://forms.gle/NhpiVLHCNcAr6VoNA)




