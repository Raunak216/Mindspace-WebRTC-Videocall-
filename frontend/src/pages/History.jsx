import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import HomeIcon from "@mui/icons-material/Home";
import styles from "../styles/historyStyle.module.css";
import { Link } from "react-router-dom";

import { IconButton } from "@mui/material";
export default function History() {
  const { getUserHistory } = useContext(AuthContext);

  const [meetings, setMeetings] = useState([]);

  const routeTo = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getUserHistory();
        setMeetings(history);
      } catch {
        // IMPLEMENT SNACKBAR
      }
    };

    fetchHistory();
  }, []);

  let formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  return (
    <div className={styles.historyMainContainer}>
      <Link to="/home">
        <h2>MindSpace</h2>
      </Link>

      {meetings.length !== 0 ? (
        meetings.map((e, i) => {
          return (
            <>
              <Card
                key={i}
                variant="outlined"
                sx={{ margin: "1rem", borderRadius: "20px", width: "30vw" }}
              >
                <CardContent
                  sx={{
                    backgroundColor: "rgba(215, 252, 199, 0.3)",
                  }}
                >
                  <Typography sx={{ fontSize: 14 }} gutterBottom>
                    Code: {e.meetingCode}
                  </Typography>

                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    Date: {formatDate(e.date)}
                  </Typography>
                </CardContent>
              </Card>
            </>
          );
        })
      ) : (
        <></>
      )}
    </div>
  );
}
