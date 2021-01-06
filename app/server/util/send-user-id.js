"use strict";

// common function to apply the user id to the response
function sendUserId(req, res) {
    res.send({
        in: true,
        id: req.user._id,
    })
}

export default sendUserId
