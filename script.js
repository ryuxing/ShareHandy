var Room=null;
var localStream = null;
var stream;
const NO_STREAM = getEmptyStream();
authInfo = null;
window.onload = async()=>{
    localStream = await navigator.mediaDevices
        .getUserMedia({
            audio : true,
            video : true
        });
    const init_local_video = document.getElementById("init-local-video");
    init_local_video.muted = true;
    init_local_video.srcObject = localStream;
    init_local_video.playsInline = true;
    await init_local_video.play();
    stream = localStream;
    authInfo = Firebase.Auth.auth.currentUser;
    initAccountStatus("",true);
    document.getElementById("account").addEventListener("click",initAccountStatus);
}
function getEmptyStream(){
    let canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = "green";
    ctx.fillRect(0,0,1,1);
    let vstream = canvas.captureStream(1);
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    let audio = new AudioContext();
    let astream = audio.createMediaStreamDestination().stream;

    return new MediaStream([vstream.getTracks()[0],astream.getTracks()[0]]);
}
async function initAccountStatus(elem, onlyDisplay){
    if(Firebase.Auth.auth.currentUser==null){
        //サインイン
        if(!onlyDisplay)authInfo = await Firebase.Auth.signIn();
        //エラー発生時は何もしない
        if(authInfo ==null){return;}
        //ログイン情報を表示
        document.querySelector("#account div").style.backgroundImage = `url("${authInfo.photoURL}")`;
        document.querySelector("#account span").innerText = authInfo.name;

        document.getElementById("join").addEventListener("click",joinRoom);
        let digits = 36 ** 5;
        peerId = authInfo.uid + "-"+ (new Date().getTime()).toString(36)+ (Math.floor(Math.random())*digits).toString(36);
        console.log(peerId);
        window.peer = new Peer(peerId,{key: window.__SKYWAY_KEY__,debug:1});
        console.log(peer);
        let profile = await Firebase.RTDB.get("profile/"+authInfo.uid);
        console.log(!("name" in profile));
        if(!("name" in profile)){
            profile = authInfo;
        }
        console.log(authInfo);
        console.log(profile);
        document.getElementById("input-name").value = profile.name;
        console.log(`[type=radio][value=${authInfo.color}]`);
        document.querySelector(`[type=radio][value=${profile.color}]`).checked=true;

        console.log(profile);
    }else{
        await Firebase.Auth.signOut(Firebase.Auth.auth);
        document.querySelector("#account div").style.backgroundImage = `url("${NO_IMAGE}")`;
        document.querySelector("#account span").innerText = "ログイン";
        document.getElementById("join").removeEventListener("click",joinRoom);
        if(window.peer != undefined){
            peer.destroy();
            delete peer;
        }
        authInfo = null;
    }
}
async function joinRoom(){
    var RoomId = "test";
    if(authInfo==null){return false;}
    let profile = {
        name: document.getElementById("input-name").value,
        photoURL:authInfo.photoURL,
        color: document.querySelector("input[name=input-color]:checked").value
    }
    await Firebase.RTDB.set("profile/"+authInfo.uid,profile);
    window.Room = new ROOM(RoomId,localStream);
    document.getElementById("join").removeEventListener("click",joinRoom);

}
class ML{
    static list ={};
    static get memberList(){
        return Object.keys(this.list);
    }
    static get l(){ return this.list};
    static async addMember(uid){
        if(uid in this.list){
            return false;
        }
        this.list[uid] = new Member(uid);
        await this.list[uid].initName();
        for(let key of this.memberList){
            let mem = this.list[key];
            //mem.addCanvas()
            console.log()
            if(mem.uid!=uid){
                mem.canvas.set(uid,)
            }
            mem.addCanvas(uid);
            console.log(mem);
        }
        return true;
    }
    static removeMember(uid){
        //canvasのIDにdisabledを追加
        //elementを削除
        //memberをdelete
        //remove from member list
    }
}
const NO_IMAGE = "/img/noimage.png";
class Member{
    currentStream = null;
    peers = [];
    streams =new Map();
    isStream = false;
    name   = "No Name";
    uid = "";
    icon   = NO_IMAGE;
    color  = "gray";
    pointer=null;
    video  = null;
    canvas = new Map();
    element= {};
    aspectRatio=1;
    constructor(uid){
        this.uid = uid;
        //Pointer
        this.pointer = document.createElement("div");
        this.pointer.style.backgroundColor=this.color;
        this.pointer.classList.add("pointer");
        this.pointer.classList.add("hidden");
        this.pointer.dataset.uid = this.uid;
        document.getElementById("pointers").appendChild(this.pointer);

        //Video
        this.element.video  = document.createElement("video");
        this.element.video.dataset.uid = this.uid;
        this.element.video.muted = true;
        this.element.video.srcObject=stream;
        this.element.video.playsInline = true;
        this.element.videoDiv = document.createElement("div");
        this.element.videoDiv.classList.add("video");
        this.element.videoDiv.appendChild(this.element.video);
        

        //Div
        this.element.div    = document.createElement("div");
        this.element.div.classList.add("member");
        this.element.div.classList.add("hidden");
        this.element.div.dataset.uid = this.uid;

        //Footer
        this.element.footer = document.createElement("div");
        this.element.footer.style.backgroundColor = this.color;
        this.element.name   = document.createElement("p");
        this.element.name.innerHTML = this.name;
        this.element.name.classList.add("name");
        this.element.footer.appendChild(this.element.name);

        //Merge
        this.element.div.appendChild(this.element.videoDiv);
        this.element.div.appendChild(this.element.footer);
        this.video = this.element.video;
        document.getElementById("stream").appendChild(this.element.div);
        //TODO Videoオブザーバー設置
        this.addCanvas("background",this);
        this.onChangeVideoSize();
    }
    addPeer(peerId){
        this.peers.push(peerId);
    }
    removePeer(peerId){
        this.peers.splice(this.peers.indexOf(peerId),1);
        delete this.stream[peerId];
    }
    async initVideo(stream){
        console.log(stream);
        let video = document.createElement("video");
        video.srcObject = stream;
        this.streams.set(stream.peerId,stream);
        await video.play();
        if(video.videoWidth>1){
            this.video.srcObject = stream;
            this.currentStream = stream;
            await this.video.play();
            this.isStream=true;
            console.log("fin.");    
        }
        this.onChangeVideoSize();
    }
    async removeVideo(peerId){
        this.stream.delete(peerId);
        this.video.srcObject = Array.from(this.streams.values)[this.streams.size-1];
        await this.video.play();
        this.isStream = false;
    }
    async replaceVideo(peerId){
        this.currentStream = this.streams.get(peerId) | this.currentStream;
        this.video.srcObject = this.currentStream;
        await this.video.play();
        this.isStream = true;
    }
    async initName(){
        let profile =  await Firebase.RTDB.get("profile/"+this.uid);
        const {name = this.name, icon = this.icon, color = this.color} = profile;
        this.name = name;
        this.element.name.innerHTML = name;
        this.element.footer.style.backgroundColor = color;
        this.pointer.style.backgroundColor = color;
        this.color  = color;
        this.icon   = icon;
    }
    onChangeVideoSize(){

        if(this.video.videoWidth<=1){
            this.aspectRatio = 0;
            this.isStream = false;
            this.element.div.classList.add("hidden");
            return false;
        }
        //アスペクト比を計算、Canvasの中身保持をするか確認する
        if(Math.round((this.video.videoWidth / this.video.videoHeight)*10)/10 !=this.ratio){
            this.ratio = Math.round((this.video.videoWidth / this.video.videoHeight)*10)/10;
            //Canvasのクリア
            this.canvas.forEach((cv)=>{
                let width=this.video.videoWidth*2;
                let height = this.video.videoHeight*2;
                cv.resize(1,1);
                cv.resize(width,height);
                cv.resizeView(this.video.width,this.video.height);
            },this);
        }else{

        }
        //canvasサイズを変更する   
        this.canvas.forEach((cv)=>{
            let width=this.video.width;
            let height = this.video.height;
            cv.resizeView(width,height);
        },this);
    }
    addCanvas(drawerUid){
        
        if(drawerUid==this.uid){
            var cv = new MyCanvas(this);
        }else{
            var cv = new Canvas(drawerUid,this);
        }
        cv.resize(this.video.videoWidth, this.video.videoHeight);
        this.canvas.set(drawerUid,cv);
    }
}
class Canvas{
    canvas;
    drawerUid;
    videoUid
    context;
    width=1;
    height=1;
    color="gray"; 
    constructor(drawerUid,member){
        this.drawerUid = drawerUid;
        this.videoUid = member.uid;
        this.canvas = document.createElement("canvas");
        this.canvas.dataset.drawer=drawerUid;
        this.canvas.dataset.source=member.uid;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.context = this.canvas.getContext("2d");
        this.color = member.color;
        //append
        member.element.videoDiv.appendChild(this.canvas);
    }
    get ctx(){
        return this.context;
    }
    resize(width=this.width,height=this.height){
        this.canvas.width = width;
        this.width = width;
        this.canvas.height = height;
        this.height = height;
    }
    resizeView(width="100%",height="100%"){
        this.canvas.style.width=width;
        this.canvas.style.height=height;
    }
    draw(list){
        for(var i of list){
            if(i.length!=(2||3)) continue;
            else if(i[0] =="s"){
                this.ctx.beginPath();
                this.ctx.strokeStyle = this.color;
                this.ctx.lineWidth = 5;
                this.ctx.moveTo(i[1],i[2]);

            }
            else if(0 <= i[0] && i[0] <= this.width  &&  0<= i[1] && i[1] <= this.height){
                this.ctx.lineTo(i[0],i[1]);
            }
        }
        this.ctx.stroke();
    }
    clear(){}
    save(){}
    eraser(){}
    capture(){}
}
class MyCanvas extends Canvas{
    static drawMode = false;
    static click = false;
    static sender = {};
    static Interval =-1;
    static pointer;
    constructor(member){
        super(member.uid,member);
        this.canvas.addEventListener("mouseenter",this.onMouseIn);
        this.canvas.addEventListener("mouseout",this.onMouseOut);
        this.canvas.addEventListener("mousedown",this.onClickdown);
        this.canvas.addEventListener("mouseup",this.onClickup);
        this.pointer = member.pointer;
    }
    onClickdown(e){
        this.click = true;
    }
    onClickup(e){
        this.click = false;

    }
    onMouseIn(e){
        this.pointer.classList.remove("hidden");

    }
    onMouseOut(e){
        this.pointer.classList.add("hidden");
        if(this.click){
            console.log(e);
            //描画終了合図
        }
        this.click = false;
    }

}

class ROOM{
    //部屋に入る処理を行う
    room = null;
    constructor(roomId,stream){
        try{
            this.room = window.peer.joinRoom(roomId, {
                mode: "sfu",
                stream: stream
            });    
        }catch(e){
            this.room=null;
            console.error(e);
        }
        //リスナーの追加
        this.room.on('peerJoin',this.onMemberJoin)
        this.room.on('stream',this.onStream);
        this.room.on('data',this.onData);
        this.room.on('peerLeave',this.onMemberLeave);
        this.room.once('open',this.onceJoin);
        this.room.once('close',this.onceLeave);        
        return this;
    }
    async onStream(stream){
        //peerIdからメンバにいない人の収集
        //Streamのpeer-idからビデオをバインドする
        //await ML.list[stream.peerId].initVideo(stream);
        let uid = stream.peerId.split("-")[0];
        console.log(uid);
        ML.addMember(uid);
        await ML.l[uid].initVideo(stream);


    }
    async onData({data,src}){
        var txt = document.createElement("span");
        txt.style.display="block";
        txt.innerText = `<${src}> ${data}`;
        document.querySelector(".test").appendChild(txt);
        //データがきたときの話
        //Switch
        //制御信号の場合
            //各機能の呼び出し
        //描画の場合
            //適切な描画の呼び出し
    }
    async onMemberJoin(peerId){
        //メンバの追加
        let uid = stream.peerId.split("-")[0];
        console.log(uid);
        ML.addMember(uid);
        console.log(peerId,"Joined.");
    }
    async onMemberLeave(peerId){
        //メンバが退出した時の挙動
        //メンバの削除
        console.log(peerId,"Left.");

    }
    async onceJoin(){
        //自分が入室した際の挙動
        ML.addMember(authInfo.uid);
        localStream.peerId = peer.id;
        await setTimeout(async() => {
            await ML.l[authInfo.uid].initVideo(localStream);
        }, 1000);
    }
    async onceLeave(){
        //自分が入室した際の挙動
    }
    replaceStream(stream){
        let ret = this.room.replaceStream(stream)
        return ret;
    }
    send(data){
        let ret = this.room.send(data);
        return ret;
    }


}