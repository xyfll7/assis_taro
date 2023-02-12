import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


export function IMarkdown() {
  const [markdown, setMarkdown] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      const res0 = await fetch("https://raw.githubusercontent.com/xyfll7/assis_taro/master/README.md");
      const res1 = await res0.text();
      setMarkdown(res1);
    })();

  }, []);

  return <div className='m10 ds '>
    <div className='p10 bcc bccblack'>
      {!markdown ? <div className='dy'>
        <div className='weui-loading-small'></div>
        <div className='pl6'>git数据，不翻墙你得不到</div>
      </div>
        : <ReactMarkdown children={markdown} remarkPlugins={[remarkGfm]} />
      }
    </div>
  </div>;
}
