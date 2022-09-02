export {Room}
class Room{
    //部屋に入る処理を行う
    room = null;
    members =[]
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
        //自分が退室した際の挙動
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