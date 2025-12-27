"use client";

import api from "@/libs/axios";
import { useEffect, useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const getMessage = async () => {
      try {
        const res = await api.get("")
        setMessage(res.data.message);
      } catch (er) {
        setError("Failed to fetch message from backend.");
      }
    }
    getMessage();
  }, [])

  return (
   <>{message || error}</>
  );
}
