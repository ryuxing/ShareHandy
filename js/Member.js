export {Member}
import { Room } from "./Room.js"
import { DrawCanvas,MyCanvas } from "./Canvas.js"
var NO_IMAGE = "./img/noimage.png"
class Member{
    static list =new Map();
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
    element;
    aspectRatio=1;
    constructor(uid){
        this.uid = uid
        //ToDo Content DOMの生成
        this.element = document.createElement("div")
        this.element.dataset.uid=uid
        this.element.classList.add("member")
        var videos = document.createElement("div")
        videos.dataset.uid=uid
        videos.classList.add("video-wrapper")
        this.element.appendChild(videos)
        document.getElementById("stream").appendChild(this.element)
        //ToDo Pointer DOMの生成
        //ToDo Observerの生成
    }
    static addPeer(peerId){
        //ToDo メンバーが存在するときとしないときの場合分け
        let uid = Room.toUid(peerId)
        var member;
        if(this.list.get(uid)==undefined){
            member = new Member(uid);
            this.list.set(uid,member);
        }else{
            //ToDo メンバにこのピア（かストリーム）を追加
            member = this.list.get(uid)
        }
        member.addPeer(peerId)
        
    }
    static addStream(peerId,stream){
        let uid = Room.toUid(peerId)
        if(!Member.list.has(uid)){
            Member.addPeer(peerId)
        }
        Member.list.get(uid).streams.set(peerId,stream)
        console.log(stream)
        if(Member.list.get(uid).streams.size==1){
            Member.list.get(uid).initVideo(stream)
        }
    }
    static removeStream(peerId){
        let uid = Room.toUid(peerId)
        this.list.get(uid).streams.delete(peerId)

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
        console.log();
        let initFlag = false
        if(stream.getVideoTracks()[0].getSettings().width<10){
            return
        }
        if(this.video==null){
            initFlag = true;
            this.video = document.createElement("video");
        }
        this.video.srcObject = stream;
        await this.video.play();
        this.onChangeVideoSize();
        console.log({"initFlag":initFlag,"mem":Member.list.values()});
        if(initFlag){
            let wrapper = this.element.getElementsByClassName("video-wrapper")[0];
            wrapper.appendChild(this.video);
            //ToDo Canvasの生成
            for(var mem of Member.list.values()){
                console.log({"canvas_create":mem},this.uid)
                let canvas;
                if(this.uid == Room.toUid(window.peer.id)){
                    canvas = new MyCanvas(mem);

                }else{
                    canvas = new DrawCanvas(this.uid,mem);
                }
                this.canvas.set(mem,canvas)
                wrapper.appendChild(canvas.canvas)    
            }
            //ToDo observerの設置
            console.log(Member.list)
        }
        
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
                console.log(width,height,this.video.clientWidth,this.video.clientHeight);
                cv.resizeView(this.video.clientWidth,this.video.clientHeight);
            },this);
        }else{

        }
        //canvasサイズを変更する   
        this.canvas.forEach((cv)=>{
            let width=this.video.clientWidth;
            let height = this.video.clientHeight;
            cv.resizeView(width,height);
        },this);
    }
    addCanvas(drawerUid){
        
        if(drawerUid==this.uid){
            var cv = new MyCanvas(this);
        }else{
            var cv = new DrawCanvas(drawerUid,this);
        }
        cv.resizeCanvas(this.video.videoWidth, this.video.videoHeight);
        this.canvas.set(drawerUid,cv);
    }
}
