'use client';
import {useState,useEffect} from 'react';import Atlas from './Atlas';import {member,BASE} from '../lib/client';
export default function Page(){const [ready,R]=useState(false);useEffect(()=>{member().then(ok=>ok?R(true):location.replace(BASE+'/login/')).catch(()=>location.replace(BASE+'/login/'))},[]);return ready?<Atlas/>:<main className="loading"><div className="brandmark">ITS</div><p>Validando acesso…</p></main>;}
