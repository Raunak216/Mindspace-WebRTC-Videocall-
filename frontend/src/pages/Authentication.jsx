import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MuiCard from "@mui/material/Card";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { AuthContext } from "../context/AuthContext";
import Snackbar from "@mui/material/Snackbar";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  [theme.breakpoints.up("sm")]: {
    width: "450px",
  },
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

export default function Authentication() {
  const [username, setUsername] = React.useState();
  const [password, setPassword] = React.useState();
  const [name, setName] = React.useState();
  const [error, setError] = React.useState();
  const [message, setMessage] = React.useState();
  const [formState, setFormState] = React.useState(0);
  const [open, setOpen] = React.useState();

  const { handleRegister, handleLogin } = React.useContext(AuthContext);
  const handelAuth = async (e) => {
    e.preventDefault();
    try {
      if (formState === 0) {
        await handleLogin(username, password);
        setMessage("Login successful");
      }
      if (formState === 1) {
        let result = await handleRegister(name, username, password);
        setMessage(result);
        setTimeout(() => {
          setFormState(0);
        }, 1500);
      }
      setError("");
      setOpen(true);
    } catch (err) {
      const message = err.response?.data?.message || "Something went wrong";
      setError(message);
    }
  };
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundImage: 'url("/HomeBg.png")',
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Card variant="outlined" sx={{ background: "rgba(220, 251, 230, 1)" }}>
        <Box sx={{ display: { xs: "flex", md: "none" } }}></Box>
        <Typography
          component="h1"
          variant="h4"
          sx={{
            width: "100%",
            fontSize: "clamp(2rem, 10vw, 2.15rem)",
            textAlign: "center",
          }}
        >
          {formState === 0 ? "Sign in" : "Sign up"}
        </Typography>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button
            variant={formState === 0 ? "contained" : ""}
            onClick={() => setFormState(0)}
          >
            Sign in
          </Button>
          <Button
            variant={formState === 1 ? "contained" : ""}
            onClick={() => setFormState(1)}
          >
            Sign up
          </Button>
        </div>
        <Box
          component="form"
          onSubmit={(e) => handelAuth(e)}
          noValidate
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: 2,
          }}
        >
          {formState === 1 ? (
            <FormControl>
              <FormLabel htmlFor="name">Full Name</FormLabel>
              <TextField
                // error={emailError}
                // helperText={emailErrorMessage}
                id="name"
                type="name"
                name="name"
                placeholder="John doe"
                autoComplete="name"
                autoFocus
                required
                fullWidth
                variant="outlined"
                onChange={(e) => {
                  setName(e.target.value);
                }}
                // color={emailError ? "error" : "primary"}
              />
            </FormControl>
          ) : (
            <></>
          )}

          <FormControl>
            <FormLabel htmlFor="username">Username</FormLabel>
            <TextField
              // error={emailError}
              // helperText={emailErrorMessage}
              id="username"
              type="username"
              name="username"
              placeholder="your@email.com"
              autoComplete="username"
              autoFocus
              required
              fullWidth
              variant="outlined"
              onChange={(e) => {
                setUsername(e.target.value);
              }}
              // color={emailError ? "error" : "primary"}
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="password">Password</FormLabel>

            <TextField
              // error={passwordError}
              // helperText={passwordErrorMessage}
              name="password"
              placeholder="••••••"
              type="password"
              id="password"
              autoComplete="current-password"
              autoFocus
              required
              fullWidth
              variant="outlined"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              // color={passwordError ? "error" : "primary"}
            />
          </FormControl>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            // onClick={validateInputs}
          >
            {formState === 0 ? "Sign in" : "Sign up"}
          </Button>
        </Box>
      </Card>
      <Snackbar
        open={open}
        autoHideDuration={4000}
        message={message}
        onClose={() => setOpen(false)}
      />
    </Box>
  );
}
