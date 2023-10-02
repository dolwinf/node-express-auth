const isAuthenticated = (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.json({ message: "User is not authenticated" });
  }
};

module.exports = isAuthenticated;
