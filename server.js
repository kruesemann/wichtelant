const url = require("url");
const fs = require("fs");
const nodemailer = require("nodemailer");
const formidable = require("formidable");
const express = require("express");
const bodyParser = require("body-parser");
const graph = require("./graph");

const app = express();
const parser = bodyParser.json();

app.use(express.static(__dirname + '/public'));

let transporter;
let sender;

function sendStatus(res, error, text) {
    res.writeHead(200, {"Content-Type": "application/JSON"});
    res.write(JSON.stringify({ error, text }));
    res.end();
    console.log(text);
}

app.post("/email", function(req, res) {
    const form = new formidable.IncomingForm();
    form.parse(req, function(_, fields, _) {
        const poolConfig = {
            host: fields.host,
            port: fields.port,
            pool: fields.pool,
            secure: fields.secure,
            tls: {
                rejectUnauthorized: fields.reject
            },
            auth: {
                user: fields.user,
                pass: fields.password,
            },
            maxConnections: 3,
            rateLimit: 1
        };
        sender = fields.sender;

        if (transporter) transporter.close();
    
        transporter = nodemailer.createTransport(poolConfig);
    
        transporter.verify(function(error, _) {
            if (error) {
                sendStatus(res, true, String(error));
            } else {
                sendStatus(res, false, "Serververbindung für Emails eingerichtet");
            }
        });
    });
});

app.post("/draw", parser, function(req, res) {
    if (!transporter) {
        sendStatus(res, true, "Serververbindung für Emails nicht eingerichtet");
        return;
    }

    const data = req.body;
    if (data.length < 3) {
        sendStatus(res, true, "Nicht genug Wichtel");
        return;
    }
    const hamiltonian = graph.draw(data);

    if (!hamiltonian.length) {
        sendStatus(res, true, "Zu viele Einschränkungen bei den Auslosbaren, keine Auslosung möglich");
        return;
    }

    const messages = [];
    for (let i = 0; i < hamiltonian.length; i++) {
        messages.push({
            from: sender,
            to: data[hamiltonian[i]].email,
            subject: "Wichtelauslosung",
            text: `
Hallo ${data[hamiltonian[i]].name},

du bist der Wichtel von ${data[hamiltonian[(i + 1) % hamiltonian.length]].name}!
${data[hamiltonian[(i + 1) % hamiltonian.length]].name} wünscht sich:

${data[hamiltonian[(i + 1) % hamiltonian.length]].wishlist}

Frohe Weihnachten!
            `
        });
    }

    while (messages.length) {
        transporter.sendMail(messages.shift(), function(error, info) {
            if (error) {
                sendStatus(res, true, String(error));
            } else {
                console.log("Email sent: " + info.response);
                if (messages.length === 0) {
                    sendStatus(res, false, "Emails versendet");
                }
            }
        });
    }
});

app.get("/*", function(req, res) {
    let q = url.parse(req.url, true);

    if (q.pathname === "/") {
        q.pathname = "/public/index.html";
    }

    fs.readFile("." + q.pathname, function(err, data) {
        if (err) {
            res.writeHead(404, {"Content-Type": "text/html"});
            return res.end("404 Not Found");
        }
        res.writeHead(200, {"Content-Type": "text/html"});
        res.write(data);
        res.end();
    });
});

app.listen(8080, function() {
    console.log("Server running at http://127.0.0.1:8080/");
});
