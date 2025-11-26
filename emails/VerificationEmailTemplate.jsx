import {
    Html,
    Body,
    Container,
    Heading,
    Text,
    Section
} from "@react-email/components";

export function VerificationEmailTemplate({ name, code }) {
    return (
        <Html>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={heading}>Hello, {name}!</Heading>

                    <Text style={paragraph}>
                        Thank you for signing up for <strong>AuthService</strong>.
                        Please use the verification code below to verify your email address.
                    </Text>

                    <Section style={codeContainer}>
                        <Text style={codeText}>{code}</Text>
                    </Section>

                    <Text style={smallText}>
                        If you did not create this account, you can safely ignore this email.
                    </Text>

                    <Text style={paragraph}>
                        Welcome aboard,
                        <strong>The AuthService Team</strong>
                    </Text>
                </Container>
            </Body>
        </Html>
    );
}

/* ---------- Styles ---------- */

const main = {
    backgroundColor: "#f5f5f5",
    padding: "20px",
    fontFamily: "Arial, sans-serif"
};

const container = {
    backgroundColor: "#ffffff",
    padding: "32px",
    borderRadius: "8px",
    maxWidth: "480px",
    margin: "0 auto",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
};

const heading = {
    fontSize: "24px",
    fontWeight: "700",
    color: "#2563eb",
    marginBottom: "16px"
};

const paragraph = {
    fontSize: "15px",
    color: "#333",
    marginBottom: "20px"
};

const codeContainer = {
    textAlign: "center",
    backgroundColor: "#2563eb",
    padding: "16px",
    borderRadius: "6px",
    marginBottom: "24px",
};


const codeText = {
    color: "#fff",
    fontSize: "32px",
    fontWeight: "bold",
    letterSpacing: "6px"
};

const smallText = {
    fontSize: "13px",
    color: "#666",
    marginTop: "12px"
};
