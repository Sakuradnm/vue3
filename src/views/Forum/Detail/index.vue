<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getForumPostDetail, likePost, getComments, createComment, likeComment, type ForumPostDetailItem, type ForumCommentItem } from '@/api/forum'
import { ElMessage } from 'element-plus'
import { ArrowLeft, ChatRound, Star } from '@element-plus/icons-vue'

const route = useRoute()
const post = ref<ForumPostDetailItem | null>(null)
const comments = ref<ForumCommentItem[]>([])
const commentContent = ref('')
const replyTo = ref<{ id: number; username: string } | null>(null)
const loading = ref(false)
const liked = ref(false)

const fetchPostDetail = async () => {
  const postId = Number(route.params.id)
  if (!postId) return

  loading.value = true
  try {
    const res = await getForumPostDetail(postId)
    post.value = res
    await fetchComments(postId)
  } catch (error: any) {
    console.error('加载失败:', error)
    ElMessage.error(error?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const fetchComments = async (postId: number) => {
  try {
    const res = await getComments(postId)
    comments.value = res
  } catch (error) {
    console.error('获取评论失败', error)
    comments.value = []
  }
}

const handleLike = async () => {
  if (!post.value) return
  try {
    await likePost(post.value.id)
    post.value.likes++
    liked.value = true
    ElMessage.success('点赞成功')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleSubmitComment = async () => {
  if (!commentContent.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  if (!post.value) return

  try {
    const userId = 1
    await createComment({
      postId: post.value.id,
      userId,
      parentId: replyTo.value?.id || 0,
      content: commentContent.value
    })

    commentContent.value = ''
    replyTo.value = null
    ElMessage.success('评论成功')
    await fetchComments(post.value.id)
  } catch (error) {
    ElMessage.error('评论失败')
  }
}

const handleReply = (comment: ForumCommentItem) => {
  replyTo.value = { id: comment.id, username: comment.username }
  commentContent.value = `回复 @${comment.username}: `
}

const handleLikeComment = async (commentId: number) => {
  try {
    await likeComment(commentId)
    ElMessage.success('点赞成功')
    if (post.value) {
      await fetchComments(post.value.id)
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const goBack = () => {
  window.history.back()
}

const getAvatarInitial = (name: string) => {
  return name ? name.slice(0, 2).toUpperCase() : '??'
}

onMounted(() => {
  fetchPostDetail()
})
</script>

<template>
  <div class="tech-forum-detail">
    <div class="dot-pattern"></div>

    <nav class="topbar">
      <div class="topbar-content" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        <span>返回论坛</span>
      </div>
    </nav>

    <div v-loading="loading" class="main-container">
      <div v-if="post" class="content-grid">
        <aside class="sidebar">
          <div class="author-card">
            <div class="author-avatar-wrapper">
              <img v-if="post.avatar" :src="post.avatar" class="author-avatar" />
              <div v-else class="avatar-placeholder">{{ getAvatarInitial(post.author) }}</div>
            </div>
            <h3 class="author-name">{{ post.author }}</h3>
            <p class="post-date">{{ post.createdAt }}</p>

            <div class="stats-grid">
              <div class="stat-box">
                <span class="stat-number">{{ post.views }}</span>
                <span class="stat-label">浏览</span>
              </div>
              <div class="stat-box">
                <span class="stat-number">{{ post.likes }}</span>
                <span class="stat-label">点赞</span>
              </div>
              <div class="stat-box">
                <span class="stat-number">{{ comments.length }}</span>
                <span class="stat-label">评论</span>
              </div>
            </div>

            <div class="tags-wrapper">
              <span v-for="tag in post.tags" :key="tag" class="tech-tag">
                {{ tag }}
              </span>
            </div>

            <button
              class="like-button"
              :class="{ 'liked': liked }"
              @click="handleLike"
            >
              <el-icon><Star /></el-icon>
              <span>{{ liked ? '已点赞' : '点赞' }}</span>
            </button>
          </div>
        </aside>

        <main class="main-content">
          <article class="post-card">
            <div class="accent-bar"></div>
            <h1 class="post-title">{{ post.title }}</h1>
            <div class="post-body" v-html="post.content"></div>
          </article>

          <section class="comments-section">
            <div class="section-header">
              <h2 class="section-title">
                <el-icon><ChatRound /></el-icon>
                评论
              </h2>
              <span class="comment-count">{{ comments.length }}</span>
            </div>

            <div class="comment-input-wrapper">
              <textarea
                v-model="commentContent"
                class="tech-textarea"
                :rows="4"
                placeholder="分享你的想法..."
                maxlength="500"
              ></textarea>
              <div class="input-footer">
                <span v-if="replyTo" class="reply-chip">
                  回复 @{{ replyTo.username }}
                  <button @click="replyTo = null">×</button>
                </span>
                <div class="input-actions">
                  <span class="char-count">{{ commentContent.length }}/500</span>
                  <button
                    class="submit-btn"
                    @click="handleSubmitComment"
                    :disabled="!commentContent.trim()"
                  >
                    发表评论
                  </button>
                </div>
              </div>
            </div>

            <div class="comments-list">
              <div v-for="(comment, index) in comments" :key="comment.id" class="comment-item">
                <div class="comment-number">{{ String(index + 1).padStart(2, '0') }}</div>
                <div class="comment-content">
                  <div class="comment-main">
                    <div class="comment-avatar">
                      <img v-if="comment.avatar" :src="comment.avatar" />
                      <div v-else class="avatar-placeholder small">{{ getAvatarInitial(comment.username) }}</div>
                    </div>
                    <div class="comment-body">
                      <div class="comment-header">
                        <span class="comment-author">{{ comment.username }}</span>
                        <span class="comment-time">{{ comment.createdAt }}</span>
                      </div>
                      <div class="comment-text">{{ comment.content }}</div>
                      <div class="comment-actions">
                        <button class="action-btn" @click="handleLikeComment(comment.id)">
                          👍 {{ comment.likes }}
                        </button>
                        <button class="action-btn" @click="handleReply(comment)">
                          回复
                        </button>
                      </div>
                    </div>
                  </div>

                  <div v-if="comment.children && comment.children.length > 0" class="replies-list">
                    <div v-for="reply in comment.children" :key="reply.id" class="reply-item">
                      <div class="reply-avatar">
                        <img v-if="reply.avatar" :src="reply.avatar" />
                        <div v-else class="avatar-placeholder small">{{ getAvatarInitial(reply.username) }}</div>
                      </div>
                      <div class="reply-body">
                        <div class="reply-header">
                          <span class="reply-author">{{ reply.username }}</span>
                          <span class="reply-time">{{ reply.createdAt }}</span>
                        </div>
                        <div class="reply-text">{{ reply.content }}</div>
                        <div class="reply-actions">
                          <button class="action-btn small" @click="handleLikeComment(reply.id)">
                            👍 {{ reply.likes }}
                          </button>
                          <button class="action-btn small" @click="handleReply(reply)">
                            回复
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="!comments || comments.length === 0" class="empty-state">
                <p>暂无评论，快来抢沙发吧~</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=DM+Sans:wght@400;500&display=swap');

.tech-forum-detail {
  min-height: 100vh;
  background: #ffffff;
  position: relative;
  font-family: 'DM Sans', sans-serif;
}

.dot-pattern {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(circle, #e0e0e0 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.3;
  pointer-events: none;
  z-index: 0;
}

.topbar {
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #f0f0f0;
  z-index: 100;
  padding: 16px 0;
}

.topbar-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #0066FF;
  font-weight: 600;
  transition: opacity 0.2s;
}

.topbar-content:hover {
  opacity: 0.7;
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px;
  position: relative;
  z-index: 1;
}

.content-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 40px;
}

.sidebar {
  position: sticky;
  top: 100px;
  height: fit-content;
}

.author-card {
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 32px 24px;
  text-align: center;
}

.author-avatar-wrapper {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #0066FF;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eef2ff;
}

.author-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #0066FF;
  background: #eef2ff;
}

.avatar-placeholder.small {
  font-size: 12px;
}

.author-name {
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.post-date {
  font-size: 13px;
  color: #999;
  margin: 0 0 24px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.stat-box {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 12px 8px;
}

.stat-number {
  display: block;
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #0066FF;
}

.stat-label {
  display: block;
  font-size: 11px;
  color: #999;
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 24px;
}

.tech-tag {
  padding: 6px 14px;
  border: 1px solid #0066FF;
  border-radius: 20px;
  font-size: 12px;
  color: #0066FF;
  background: rgba(0, 102, 255, 0.05);
  transition: all 0.2s;
}

.tech-tag:hover {
  background: #0066FF;
  color: #fff;
}

.like-button {
  width: 100%;
  padding: 12px;
  border: 2px solid #0066FF;
  background: #fff;
  color: #0066FF;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
}

.like-button:hover {
  background: rgba(0, 102, 255, 0.1);
  transform: translateY(-2px);
}

.like-button.liked {
  background: #0066FF;
  color: #fff;
}

.main-content {
  min-width: 0;
}

.post-card {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 40px;
  margin-bottom: 32px;
  position: relative;
  overflow: hidden;
}

.accent-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #0066FF 0%, #00D4FF 100%);
}

.post-title {
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 32px 0;
  line-height: 1.3;
}

.post-body {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
}

.post-body :deep(h2) {
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  margin: 32px 0 16px;
  color: #1a1a1a;
}

.post-body :deep(h3) {
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  margin: 24px 0 12px;
  color: #1a1a1a;
}

.post-body :deep(p) {
  margin: 16px 0;
}

.post-body :deep(img) {
  max-width: 100%;
  border-radius: 8px;
  margin: 20px 0;
}

.comments-section {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 40px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
}

.section-title {
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.comment-count {
  background: #0066FF;
  color: #fff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.comment-input-wrapper {
  margin-bottom: 40px;
}

.tech-textarea {
  width: 100%;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  resize: vertical;
  transition: border-color 0.2s;
}

.tech-textarea:focus {
  outline: none;
  border-color: #0066FF;
}

.input-footer {
  margin-top: 12px;
}

.reply-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(0, 102, 255, 0.1);
  border-radius: 20px;
  font-size: 13px;
  color: #0066FF;
  margin-bottom: 12px;
}

.reply-chip button {
  background: none;
  border: none;
  color: #0066FF;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-count {
  font-size: 13px;
  color: #999;
}

.submit-btn {
  padding: 10px 24px;
  background: #0066FF;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #0052cc;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.comment-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
  transition: background 0.2s;
}

.comment-item:hover {
  background: #f5f5f5;
}

.comment-number {
  font-family: 'DM Mono', monospace;
  font-size: 14px;
  color: #0066FF;
  font-weight: 600;
  min-width: 24px;
}

.comment-content {
  flex: 1;
}

.comment-main {
  display: flex;
  gap: 12px;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: #eef2ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.comment-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.comment-body {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.comment-author {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 15px;
}

.comment-time {
  font-size: 13px;
  color: #999;
}

.comment-text {
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 12px;
  word-break: break-word;
}

.comment-actions {
  display: flex;
  gap: 16px;
}

.action-btn {
  background: none;
  border: none;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(0, 102, 255, 0.1);
  color: #0066FF;
}

.action-btn.small {
  font-size: 12px;
}

.replies-list {
  margin-top: 16px;
  margin-left: 52px;
  padding-left: 16px;
  border-left: 2px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reply-item {
  display: flex;
  gap: 10px;
  padding: 12px;
  background: #fff;
  border-radius: 6px;
}

.reply-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: #eef2ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reply-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reply-body {
  flex: 1;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.reply-author {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 14px;
}

.reply-time {
  font-size: 12px;
  color: #999;
}

.reply-text {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 8px;
  word-break: break-word;
}

.reply-actions {
  display: flex;
  gap: 12px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
  }

  .main-container {
    padding: 20px;
  }
}

@media (max-width: 768px) {
  .post-card, .comments-section {
    padding: 24px;
  }

  .post-title {
    font-size: 24px;
  }

  .replies-list {
    margin-left: 20px;
  }
}
</style>