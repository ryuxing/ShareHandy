export {DrawCanvas, MyCanvas, Painter}
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
    constructor(member){
        super(member.uid,member);
        this.canvas.addEventListener("mouseenter",this.onMouseIn);
        this.canvas.addEventListener("mouseout",this.onMouseOut);
        this.canvas.addEventListener("mousedown",this.onClickdown);
        this.canvas.addEventListener("mouseup",this.onClickup);
        this.canvas.addEventListener("mousemove",this.onMouseMove);
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
        console.log("MouseMove");
        console.log(e.offsetX,e.offsetY);
        console.log(MyCanvas.isClick,MyCanvas.drawMode,MyCanvas.isDrawing);
        if(MyCanvas.isClick && MyCanvas.drawMode){
            if(!MyCanvas.isDrawing){
                MyCanvas.isDrawing=true;
                var send = ["s",e.offsetX,e.offsetY];
                //this.queue.queue.push(send);
                this.draw([send]);
                console.log("Start");
            }else{
                MyCanvas.isDrawing=true;
                var send = [e.offsetX,e.offsetY];
                //this.queue.queue.push(send);
                console.log(this);
                this.draw([send]);
                console.log("->")
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
