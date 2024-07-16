const inappropriateWords = ['damn', 'fuck', 'bastard', 'shit', 'bitch', 
                            'fuck', 'cunt', 'bugger', 'idiot', 'sex'];

function checkInappropriateWords(req, res, next) {
  const username = req.body.username;
  if (inappropriateWords.some(word => username.toLowerCase().includes(word))) {
    return res.status(400).json({ message: 'Username contains inappropriate words' });
  }
  next();
}

module.exports = checkInappropriateWords;
