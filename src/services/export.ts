import {Platform,Share} from 'react-native';
import type {Learner} from '../core/learning';
export async function exportLearning(state:Learner){
  const json=JSON.stringify(state,null,2);
  if(Platform.OS!=='web'){await Share.share({title:'TechFluent learning record',message:json});return;}
  const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='techfluent-learning.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500);
}
