export {Member}
class Member{
    static list ={};
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
        //ToDo Content DOMの生成
        //ToDo Pointer DOMの生成
        //ToDo Observerの生成
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
