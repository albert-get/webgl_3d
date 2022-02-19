import loadable from '@loadable/component'

const Webgl=loadable(()=>import('../../components/12/15'))
export default function Index (){
    return <Webgl fallback={<div style={{width:'100vw',height:'100vh',textAlign:'center',background:'red'}}>正在加载中</div>}/>
}
