const express = require("express");
const router = express.Router();
const Registration = require("../models/Registration");

// POST /api/register-team
// POST /api/register-team
router.post("/register-team", async (req, res) => {
  try {
    const { player1, player2, category } = req.body;

    if (!player1 || !player2 || !category) {
      return res.status(400).json({ message: "Missing data" });
    }

    // Helper to count a player's existing entries
    const countEntries = async (whatsapp) => {
      return await Registration.countDocuments({
        $or: [
          { "player1.whatsapp": whatsapp },
          { "player2.whatsapp": whatsapp },
        ],
      });
    };

    const count1 = await countEntries(player1.whatsapp);
    const count2 = await countEntries(player2.whatsapp);

    if (count1 >= 2 || count2 >= 2) {
      return res.status(400).json({
        message: "One or both players are already registered in 2 categories",
      });
    }

    // Proceed to save
    const team = new Registration({ player1, player2, category });
    await team.save();

    res.json({ message: "Registered successfully" });
  } catch (error) {
    console.error("Error saving team registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/participants - with age & eligibility
router.get("/participants", async (req, res) => {
  try {
    const teams = await Registration.find();
    const refDate = new Date("2024-12-09");

    const getAge = (dobStr) => {
      const [d, m, y] = dobStr.split("/");
      const dob = new Date(`${y}-${m}-${d}`);
      let age = refDate.getFullYear() - dob.getFullYear();
      const mDiff = refDate.getMonth() - dob.getMonth();
      if (mDiff < 0 || (mDiff === 0 && refDate.getDate() < dob.getDate()))
        age--;
      return age;
    };

    const enhanced = teams.map((team) => {
      const age1 = getAge(team.player1.dob);
      const age2 = getAge(team.player2.dob);
      const combinedAge = age1 + age2;
      const categoryAge = parseInt(team.category);
      const eligible = combinedAge >= categoryAge;

      return {
        ...team._doc,
        player1Age: age1,
        player2Age: age2,
        combinedAge,
        eligible,
      };
    });

    res.json(enhanced);
  } catch (error) {
    console.error("Error fetching participants:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/mark-lucky/:id
router.patch("/mark-lucky/:id", async (req, res) => {
  try {
    const { luckyEligible } = req.body;

    const updated = await Registration.findByIdAndUpdate(
      req.params.id,
      { luckyEligible },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.json({ message: "Updated successfully", updated });
  } catch (error) {
    console.error("Error updating luckyEligible:", error);
    res.status(500).json({ message: "Internal error" });
  }
});
// GET /api/lucky-doubles
router.get("/lucky-doubles", async (req, res) => {
  try {
    const refDate = new Date("2024-12-09");

    const getAge = (dobStr) => {
      const [d, m, y] = dobStr.split("/");
      const dob = new Date(`${y}-${m}-${d}`);
      let age = refDate.getFullYear() - dob.getFullYear();
      const mDiff = refDate.getMonth() - dob.getMonth();
      if (mDiff < 0 || (mDiff === 0 && refDate.getDate() < dob.getDate()))
        age--;
      return age;
    };

    const teams = await Registration.find({ luckyEligible: true });

    let allPlayers = [];
    teams.forEach((team) => {
      if (team.player1)
        allPlayers.push({ ...team.player1, age: getAge(team.player1.dob) });
      if (team.player2)
        allPlayers.push({ ...team.player2, age: getAge(team.player2.dob) });
    });

    // De-duplicate by WhatsApp
    const unique = {};
    allPlayers.forEach((p) => {
      unique[p.whatsapp] = p;
    });

    const finalList = Object.values(unique);

    const X = finalList.filter((p) => p.age <= 50);
    const Y = finalList.filter((p) => p.age > 50);

    const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);

    const paired = [];
    const xShuffled = shuffle(X);
    const yShuffled = shuffle(Y);
    const count = Math.min(xShuffled.length, yShuffled.length);

    for (let i = 0; i < count; i++) {
      paired.push({
        playerX: xShuffled[i],
        playerY: yShuffled[i],
      });
    }

    console.log("Group X:", X);
    console.log("Group Y:", Y);
    console.log("Pairs:", paired);

    res.json({
      pairs: paired,
      remainingX: xShuffled.slice(count),
      remainingY: yShuffled.slice(count),
    });
  } catch (err) {
    console.error("Lucky Doubles error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
