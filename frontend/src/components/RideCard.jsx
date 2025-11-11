// frontend/src/components/RideCard.jsx
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, Chip, Stack, Button, Box } from "@mui/material";

const RideCard = ({ ride, seatsNeeded = 1 }) => {    // ✅ new prop
  const navigate = useNavigate();

  const seatsLeft = Math.max(0, ride.seats - (ride.bookedSeats || 0));
  const enoughSeats = seatsLeft >= seatsNeeded;      // ✅ compare

  const statusColor =
    ride.status === "cancelled" ? "error" :
    ride.status === "full" ? "warning" : "success";

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {ride.fromLocation?.name} → {ride.toLocation?.name}
          </Typography>
          <Chip
            label={ride.status}
            color={statusColor}
            size="small"
            sx={{ textTransform: "capitalize" }}
          />
        </Stack>

        <Typography sx={{ mt: 1 }}>
          Seats left: <b>{seatsLeft}</b> &nbsp; • &nbsp; Price: <b>₹{ride.price}</b>
        </Typography>
        <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
          Date: {new Date(ride.date).toLocaleString()}
        </Typography>

        {seatsNeeded > 1 && (
          <Typography sx={{ mt: 1 }}>
            Seats requested: <b>{seatsNeeded}</b>
          </Typography>
        )}

        {/* ✅ Highlight if insufficient seats */}
        {!enoughSeats && (
          <Typography sx={{ mt: 0.5, color: "error.main" }}>
            Not enough seats available
          </Typography>
        )}

        <Box sx={{ mt: 2 }}>

          {/* ✅ View Details Button */}
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate(`/ride/${ride._id}`)}
            sx={{ mr: 1 }}
          >
            View Details
          </Button>

          {/* ✅ Quick Book optional (navigates to details) */}
          {ride.status === "available" && enoughSeats && (
            <Button
              variant="contained"
              size="small"
              onClick={() => navigate(`/ride/${ride._id}`, { state: { seatsNeeded } })}
            >
              Book Now
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default RideCard;
