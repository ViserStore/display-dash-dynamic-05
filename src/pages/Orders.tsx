
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Immediately redirect to all orders without any delay
    navigate("/orders/all", { replace: true });
  }, [navigate]);

  // Don't show any loading state, just redirect
  return null;
};

export default Orders;
