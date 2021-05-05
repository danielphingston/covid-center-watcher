const fetch = require("node-fetch");
const nodemailer = require("nodemailer");
const tableify = require("tableify");
require("dotenv").config();

async function processData(data) {
    return data
        .filter(
            (x) =>
                x.sessions.length &&
                x.sessions.some((x) => x.available_capacity > 0)
        )
        .map((x) => ({
            name: x.name,
            address: x.address,
            district: x.district_name,
            block: x.block_name,
            sessions: x.sessions
                .filter((x) => x.available_capacity > 0)
                .map((x) => ({
                    date: x.date,
                    available: x.available_capacity,
                    ageLimit: x.min_age_limit,
                    vaccine: x.vaccine,
                    slots: x.slots,
                })),
        }));
}

async function sendMail(data) {
    const body = `<styles><div style="width:100%;overflow:auto;" >${tableify(
        data
    )}</div>`;

    const transporter = await getGmailTransporter();
    try {
        let info = await transporter.sendMail({
            from: process.env.EMAIL, // sender address
            to: process.env.EMAIL, // list of receivers
            bcc:
                process.env.NODE_ENV == "test"
                    ? undefined
                    : await getRecipients(),
            subject: "New Available Vaccination Centers", // Subject line
            html: body, // html body
        });
        console.log(info);
    } catch (error) {
        console.log(error);
    }
}

async function getGmailTransporter() {
    let gmailTransporter = await nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
    });
    return gmailTransporter;
}

async function handler() {
    const today = new Date();

    const date = `${today.getDate()}-${
        today.getMonth() + 1
    }-${today.getFullYear()}`;

    const district = process.env.DISTRICT;

    const resp = await fetch(
        `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${district}&date=${date}`
    );
    const { centers } = await resp.json();
    const processedData = await processData(centers);
    if (processedData.length) {
        await sendMail(processedData);
        return "Email Sent";
    }
    return "No Available Centers";
}

async function getRecipients() {
    const data = await fetch(process.env.GOOGLE_SHEET_URL).then((resp) =>
        resp.text()
    );

    return data.split("\r\n");
}

exports.handler = handler;

if (process.env.NODE_ENV === "test") {
    getRecipients().then((list) => console.log(list));
    handler().then(() => console.log("done"));
}
