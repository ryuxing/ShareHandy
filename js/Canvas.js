export {DrawCanvas, MyCanvas, Painter}
import {Room} from "./Room.js";
import {Member} from "./Member.js"
class DrawCanvas{
    canvas;
    drawerUid;
    videoUid
    context;
    width=1;
    height=1;
    color="gray"; 
    constructor(drawerUid,member){
        //ToDo Canvasを作る
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d");
        this.drawerUid = drawerUid;
        this.videoUid = member.uid;
        this.width = member.video.videoWidth;
        this.height = member.video.videoHeight;
        this.color = member.color;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }
    get ctx(){
        return this.context;
    }
    resizeCanvas(width=this.width,height=this.height){
        this.canvas.width = width;
        this.width = width;
        this.canvas.height = height;
        this.height = height;
    }
    resizeView(width="100",height="100"){
        this.canvas.style.width=width +"px";
        this.canvas.style.height=height+"px";
        console.log(`width,height`)
    }
    draw(list){
        console.log("drawn",list);
        for(var i of list){
            if(i.length!=2&&i.length!=3) continue;
            if(i[0] =='s'){
                console.log("BeginPath");
                this.ctx.beginPath();
                this.ctx.strokeStyle = this.color;
                this.ctx.lineWidth = 3;
                this.ctx.moveTo(i[1],i[2]);

            }
            else if(0 <= i[0] && i[0] <= this.width  &&  0<= i[1] && i[1] <= this.height){
                this.ctx.lineTo(i[0],i[1]);
            }
        }
        this.ctx.stroke();
        console.log("storoke",list);
    }
    save(){}
    capture(){}
}
class MyCanvas extends DrawCanvas{
    static drawMode = true;
    static isClick = false;
    static isDrawing= false;
    static sender = {};
    static Interval =-1;
    static pointer;
    static queue = []
    constructor(member){
        this.canvas.classList.add("mycv")
        super(Room.toUid(window.peer.id),member);
        this.canvas.addEventListener("mouseenter",this.onMouseIn);
        this.canvas.addEventListener("mouseout",this.onMouseOut);
        this.canvas.addEventListener("mousedown",this.onClickdown);
        this.canvas.addEventListener("mouseup",this.onClickup);
        this.canvas.addEventListener("mousemove",{"class":this,"handleEvent":this.onMouseMove},false);
        this.pointer = member.pointer;
        this.queue = {
            member : this.drawerUid,
            queue : new Array()
        };    
    }
    onClickdown(e){
        MyCanvas.isClick = true;
    }
    onClickup(e){
        MyCanvas.isClick = false;
        MyCanvas.isDrawing = false;

    }
    onMouseIn(e){
        //this.pointer.classList.remove("hidden");
        console.log("MouseIn");
        console.log(e);
        MyCanvas.isDrawing=false;

    }
    onMouseMove(e){
        //console.log("MouseMove");
        console.log(e.offsetX,e.offsetY);
        //console.log(MyCanvas.isClick,MyCanvas.drawMode,MyCanvas.isDrawing);
        if(MyCanvas.isClick && MyCanvas.drawMode){
            console.log(this)
            if(!MyCanvas.isDrawing){
                MyCanvas.isDrawing=true;
                var send = ["s",e.offsetX,e.offsetY];
                //this.class.queue.push(send);
                let queue = [send];
                this.class.draw(queue);
                console.log("Start");
            }else{
                MyCanvas.isDrawing=true;
                var send = [e.offsetX,e.offsetY];
                //this.queue.push(send);
                console.log(this);
                let queue = [send];
                this.class.draw(queue);
                //console.log("->")
            }
            //送る処理
        }
    }
    onMouseOut(e){
        //this.pointer.classList.add("hidden");
        if(MyCanvas.isClick){
            console.log("MouseOut");
            console.log(e);
            //描画終了合図
        }
        MyCanvas.isClick = false;
        MyCanvas.isDrawing=false;
    }

}

class Painter{
    ctx;
    draw(){}
    erase(){}
    clear(){}
}
