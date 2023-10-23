import express from "express";
import cors from "cors";
import dotenv from "dotenv"
import {RtcTokenBuilder, RtcRole} from 'agora-access-token';


dotenv.config();
const app = express();
const port = process.env.PORT || 4000;

const APP_ID = process.env.APP_ID;
const APP_CERTIFICATE = process.env.APP_CERTIFICATE

const nocache = async (req, resp, next) => {
    
    resp.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    resp.header('Expires', '-1');
    resp.header('Pragma', 'no-cache');
    next();
}

const generateAccessToken = (req, resp) => {
    resp.header('Acess-Control-Allow-Origin', '*');
    const channelName = req.query.channelName;
    if(!channelName){
        return resp.status(500).json({ 'error': 'channel is required'});
    }

    let uid = req.query.uid;
    if(!uid || uid == ''){
        uid = 0;
    }

    let role = RtcRole.SUBSCRIBER;
    if (req.query.role == 'publisher'){
        role = RtcRole.PUBLISHER;
    }

    let expireTime = req.query.expireTime;
    if(!expireTime || expireTime == '') {
        expireTime = 3600;
    } else {
        expireTime = parseInt(expireTime, 10);
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTime + expireTime;

    const token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, uid, role, privilegeExpireTime)

    return resp.json({ 'token': token })

}


    app.get('/access_token', nocache, generateAccessToken)

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));
    app.get("/", (req, res) => {
        res.send("Welcome onboard!");
    });

    app.listen(port, () => {
        console.log(`Server ready at ${port}`)
    })