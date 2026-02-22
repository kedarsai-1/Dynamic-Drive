// frontend/src/components/RideCard.jsx
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, Chip, Stack, Button, Box } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";

const RideCard = ({ ride, seatsNeeded = 1 }) => {    // ✅ new prop
  const navigate = useNavigate();

  const seatsLeft = Math.max(0, ride.seats - (ride.bookedSeats || 0));
  const enoughSeats = seatsLeft >= seatsNeeded;      // ✅ compare

  const statusColor =
    ride.status === "cancelled" ? "error" :
    ride.status === "full" ? "warning" : "success";

    return (
      <Card
        sx={{
          mb: 2,
          borderRadius: "14px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          px: 2,
          py: 2,
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "translateY(-3px)",
            boxShadow: "0 12px 28px rgba(0,0,0,0.08)",
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
        >
    
          {/* LEFT SIDE */}
          <Stack direction="row" spacing={2} flex={4} alignItems="center">
    
            {/* DRIVER AVATAR + TOOLTIP */}
            <Tooltip
              arrow
              title={
                <Box>
                  <Typography fontWeight={700}>
                    {ride.driver?.name || "Driver"}
                  </Typography>
                  <Typography fontSize={12}>
                    Verified driver
                  </Typography>
                </Box>
              }
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  bgcolor: "#E5F6FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  color: "#00AFF5",
                }}
              >
                {ride.driver?.name?.charAt(0) || "D"}
              </Box>
            </Tooltip>
    
            {/* ROUTE TIMELINE */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "#00AFF5",
                  }}
                />
                <Typography fontWeight={700}>
                  {ride.fromLocation?.name}
                </Typography>
              </Stack>
    
              <Box
                sx={{
                  ml: "3px",
                  borderLeft: "2px dashed #ccc",
                  height: 14,
                  my: 0.5,
                }}
              />
    
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "#111",
                  }}
                />
                <Typography fontWeight={700}>
                  {ride.toLocation?.name}
                </Typography>
              </Stack>
    
              <Typography
  sx={{
    fontSize: 22,
    fontWeight: 800,
    color: "#111",
    mt: 0.5,
  }}
>
  {new Date(ride.date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}
</Typography>

<Typography sx={{ fontSize: 13, color: "gray" }}>
  {new Date(ride.date).toLocaleDateString()}
</Typography>
            </Box>
          </Stack>
    
          {/* SEATS */}
          <Box flex={1}>
            <Chip
              label={`${seatsLeft} seats`}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Box>
    
          {/* PRICE */}
          <Typography
            flex={1}
            sx={{
              fontWeight: 800,
              color: "#00AFF5",
              fontSize: 20,
            }}
          >
            ₹{ride.price}
          </Typography>
    
          {/* ACTION BUTTONS */}
          <Stack direction="row" spacing={1} flex={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate(`/ride/${ride._id}`)}
            >
              Details
            </Button>
    
            {ride.status === "available" && enoughSeats && (
              <Button
                variant="contained"
                size="small"
                onClick={() =>
                  navigate(`/ride/${ride._id}`, {
                    state: { seatsNeeded },
                  })
                }
                sx={{
                  bgcolor: "#00AFF5",
                  fontWeight: 700,
                  "&:hover": { bgcolor: "#0095d6" },
                }}
              >
                Book
              </Button>
            )}
          </Stack>
        </Stack>
      </Card>
    );
};

export default RideCard;
