import { useState, useSyncExternalStore } from 'react'
import { Button, Input, Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import type { SyncController } from './sync-controller.ts'

export function SyncControl({ sync }: { sync: SyncController }) {
  const status = useSyncExternalStore(sync.subscribe, sync.getSnapshot, sync.getSnapshot)
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)
  const submit = async (register: boolean) => {
    setPending(true); setMessage('')
    try {
      if (register) {
        const signedIn = await sync.signUp(email.trim(), password)
        setMessage(signedIn ? '注册并登录成功' : '请先查收邮件并完成验证，然后返回这里登录。')
      } else { await sync.signIn(email.trim(), password); setMessage('登录成功') }
      setPassword('')
    } catch (error) { setMessage(error instanceof Error ? error.message : '登录失败') }
    finally { setPending(false) }
  }
  return <>
    <Button size="sm" onClick={() => { setOpen(true) }}>☁ {status.text}</Button>
    <Modal open={open} onClose={() => { setOpen(false); setPassword('') }} title="便签云同步" closeLabel="关闭">
      <div style={{ display: 'grid', gap: 12, minWidth: 300 }}>
        <div>{status.text}{status.email ? ` · ${status.email}` : ''}</div>
        {status.state === 'signed-out' || !status.email ? <>
          <div>创建一个便签同步账号，两台电脑使用同一个账号登录。</div>
          <Input value={email} type="email" placeholder="邮箱" onChange={event => { setEmail(event.target.value) }} />
          <Input value={password} type="password" placeholder="密码" onChange={event => { setPassword(event.target.value) }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="sm" disabled={pending || !email || !password} onClick={() => { void submit(false) }}>登录</Button>
            <Button size="sm" disabled={pending || !email || !password} onClick={() => { void submit(true) }}>注册账号</Button>
          </div>
        </> : <Button size="sm" onClick={() => { sync.signOut(); setMessage('已退出登录') }}>退出登录</Button>}
        {message && <div role="status">{message}</div>}
      </div>
    </Modal>
  </>
}
