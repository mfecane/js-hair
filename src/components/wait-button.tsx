import { LoadingButton } from '@mui/lab'
import { ReactNode, useState } from 'react'

interface IWaitButtonProps {
  callback: () => Promise<void>
  children: ReactNode
  variant?: 'text' | 'outlined' | 'contained'
}

const WaitButton: React.FC<IWaitButtonProps> = ({
  callback,
  children,
  variant = 'outlined',
}) => {
  const [loading, setloading] = useState(false)

  const handleClick = async () => {
    setloading(true)
    await callback()
    setloading(false)
  }

  return (
    <LoadingButton loading={loading} variant={variant} onClick={handleClick}>
      {children}
    </LoadingButton>
  )
}

export default WaitButton
