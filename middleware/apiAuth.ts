import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '@/utils/auth'

export function apiAuthMiddleware(handler: Function) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const token = req.headers.authorization?.split(' ')[1]
      
      if (!token) {
        return res.status(401).json({ message: '未授权访问' })
      }

      const verified = await verifyToken(token)
      if (!verified) {
        return res.status(401).json({ message: '无效的令牌' })
      }

      return handler(req, res)
    } catch (error) {
      return res.status(500).json({ message: '服务器错误' })
    }
  }
} 