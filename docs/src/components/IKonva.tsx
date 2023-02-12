import { useEffect } from 'react';
import Konva from 'konva';
export function IKonva() {
  useEffect(() => {
    // create a wrapper around native canvas element (with id="c")
    var stage = new Konva.Stage({
      container: '#container',
      width: 300,
      height: 300,
    });
    var layer = new Konva.Layer();

    var circle = new Konva.Circle({
      x: 200,
      y: 200,
      radius: 70,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 4,
    });

    // add the shape to the layer
    layer.add(circle);
    var textpath = new Konva.TextPath({
      x: 20,
      y: 20,
      fill: '#fff',
      fontSize: 16,
      fontFamily: 'Arial',
      text: "这是一段沿着路径的文字，啊哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈",
      data: 'M10,10 C0,0 10,180 100,100 S300,150 4.0.190'
    });

    layer.add(textpath);

    var PATH = 'M 0 40 a 40 40 0 1 1 1 0';

    var text = new Konva.TextPath({
      x: 200,
      y: 200,
      fill: '#000',
      textBaseline: 'bottom',
      fontSize: 15,
      fontFamily: 'Arial',
      text: '    中中中',
      data: PATH
    });
    // center text
    text.align('center');
    layer.add(text);
    var path = new Konva.Path({
      x: 200,
      y: 200,
      stroke: 'green',
      data: PATH
    });
    layer.add(path);



    // add the layer to the stage
    stage.add(layer);

  }, []);
  return <div className='ds m10'>
    <div id="container" style={{ border: "1px solid gray" }}></div>
  </div>;
}
