
var Room=null;
var Stream = null;
window.onload = async()=>{
    Stream = await navigator.mediaDevices
        .getUserMedia({
            audio : true,
            video : true
        });
    const init_local_video = document.getElementById("init-local-video");
    init_local_video.muted = true;
    init_local_video.srcObject = Stream;
    init_local_video.playsInline = true;
    await init_local_video.play(); 
    document.getElementById("join").addEventListener("click",()=>{
        if(Room == null){
            Room = new ROOM("test",Stream);
        }
    })
}
const peer = (window.peer = new Peer({
key: window.__SKYWAY_KEY__,
debug: 3,
}));

class ML{
    static list ={};
    static get memberList(){
        
    }
    static addMember(peerId){

    }
    static removeMember(peerId){

    }
}
const NO_IMAGE = "image/noimage.png";
class Member{
    Stream = null;
    isStream = false;
    peerId = "";
    name   = "No Name";
    icon   = NO_IMAGE;
    color  = "gray";
    pointer=null;
    video  = null;
    canvas = {};
    element= null;
    aspectRatio=1;
    constructor(peerId){
        this.peerId = peerId;
        //Pointer
        this.pointer = document.createElement("div");
        this.pointer.style.backgroundColor=this.color;
        this.pointer.classList.add("pointer");
        this.pointer.classList.add("hidden");
        document.getElementById("pointers").appendChild(this.pointer);
    }
    async initVideo(stream){
        this.isStream = true;
        //Video
        this.stream = stream;
        this.element.video  = document.createElement("video");
        this.element.video.muted = true;
        this.element.video.srcObject=stream;
        this.element.video.playsInline = true;
        //Div
        this.element.div    = document.createElement("div");
        this.element.div.classList.add("member");
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
            this.room = peer.joinRoom(roomId, {
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
        this.room.on('stream',this.onStream);
        this.room.once('open',this.onceJoin);
        this.room.once('close',this.onceLeave);        
        return this;
    }
    async onStream(stream){
        //peerIdからメンバにいない人の収集
        //Streamのpeer-idからビデオをバインドする
        //await ML.list[stream.peerId].initVideo(stream);

        //Test
        console.log(stream.peerId);
        var vi = document.createElement("video");
        vi.style.width="200px";
        vi.style.height="auto";
        vi.srcObject = stream;
        vi.dataset.id= stream.peerId;
        console.log(stream);
        document.body.appendChild(vi);
        await vi.play();
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