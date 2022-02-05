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
    authInfo = FirebaseAuth.currentUser;
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
    if(FirebaseAuth.currentUser==null){
        if(!onlyDisplay)authInfo = await FirebaseSignIn();
        if(authInfo ==null){return;}
        document.querySelector("#account div").style.backgroundImage = `url("${authInfo.photoURL}")`;
        document.querySelector("#account span").innerText = authInfo.name;
        document.getElementById("join").addEventListener("click",joinRoom);
        let digits = 36 ** 5;
        peerId = authInfo.uid + "-"+ (new Date().getTime()).toString(36)+ (Math.floor(Math.random())*digits).toString(36);
        console.log(peerId);
        window.peer = new Peer(peerId,{key: window.__SKYWAY_KEY__,debug:1});
        console.log(peer);
    
    }else{
        await FirebaseSignOut(FirebaseAuth);
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
function joinRoom(){
    var RoomId = "test";
    if(authInfo==null){return false;}
    window.Room = new ROOM(RoomId,NO_STREAM);
    document.getElementById("join").removeEventListener("click",joinRoom);

}
class ML{
    static list ={};
    static get memberList(){
        return Object.keys(this.list);
    }
    static get l(){ return this.list};
    static addMember(uid){
        if(uid in this.list){
            return false;
        }
        this.list[uid] = new Member(uid);
        for(let mem of this.memberList){
            //mem.addCanvas()
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
    streams ={};
    isStream = false;
    name   = "No Name";
    uid = "";
    icon   = NO_IMAGE;
    color  = "gray";
    pointer=null;
    video  = null;
    canvas = {};
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
        this.element.div.appendChild(this.element.video);
        this.element.div.appendChild(this.element.footer);
        this.video = this.element.video;
        document.getElementById("stream").appendChild(this.element.div);
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
        this.video.srcObject = stream;
        this.currentStream = stream;
        await this.video.play();
        //Videoのオブザーバ追加


    }
    initName(name = "No Name", color = "gray", icon = NO_IMAGE){
        this.name = name;
        if(this.isStream){
            this.element.name.innerHTML = name;
            this.element.footer.style.backgroundColor = color;
            this.pointer.style.backgroundColor = color;
            this.color  = color;
            this.icon   = icon;
        }
    }
    onChangeVideoSize(){
        //アスペクト比を計算、Canvasの中身保持をするか確認する
        //Canvasの大きさ変更
        if(this.video/*.RATIO ==this.ratio*/){
            //Canvasのクリア
        }
        //canvasサイズを変更する   
    }
}
class Canvas{
    drawerPeerId;
    context;
    width;
    height;
    get ctx(){
        return this.context;
    }
    init(width=600,height=600){}
    draw(){}
    clear(){}
    save(){}
    eraser(){}
    capture(){}
}
class MyCanvas extends Canvas{
    drawMode = false;
    onMouseIn(){}
    onMouseOut(){}
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
        ML.l[uid].initVideo(stream);

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
        console.log(peerId,"Joined.");
    }
    async onMemberLeave(peerId){
        //メンバが退出した時の挙動
        //メンバの削除
        console.log(peerId,"Left.");

    }
    async onceJoin(){
        //自分が入室した際の挙動
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