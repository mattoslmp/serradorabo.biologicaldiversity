// Parse only Supabase recovery verification links from the configured project.
// Never log, persist, or send the full link to any third-party service.
export function extractRecoveryToken(link, supabaseUrl) {
  const raw=String(link??'').trim();
  let url, expected;
  try {
    url=new URL(raw);
    expected=new URL(supabaseUrl);
  } catch {
    throw new Error('Cole o endereço completo copiado do botão de recuperação do e-mail.');
  }
  if(url.protocol!=='https:'||expected.protocol!=='https:'||
     url.origin!==expected.origin||
     url.pathname!=='/auth/v1/verify'||
     url.searchParams.get('type')!=='recovery') {
    throw new Error('Este endereço não é um link de recuperação válido do Serra do Rabo.');
  }
  const tokens=url.searchParams.getAll('token');
  if(tokens.length!==1||!(/^[A-Za-z0-9_-]{32,512}$/.test(tokens[0]))) {
    throw new Error('O link está incompleto. Copie o endereço inteiro do botão do e-mail.');
  }
  return tokens[0];
}
