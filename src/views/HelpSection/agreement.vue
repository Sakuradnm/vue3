<script setup lang="ts">
import { ref } from 'vue';

// 协议接受状态
const agreedToTerms = ref(false);
const showAgreementModal = ref(false);

// 协议章节折叠状态
const expandedSections = ref<Set<number>>(new Set([1])); // 默认展开第一章节

  // 在setup部分新增这两个方法
const handlePrint = () => {
  window.print();
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 切换章节展开状态
const toggleSection = (sectionNumber: number): void => {
  if (expandedSections.value.has(sectionNumber)) {
    expandedSections.value.delete(sectionNumber);
  } else {
    expandedSections.value.add(sectionNumber);
  }
};

// 一键展开/折叠所有章节
const toggleAllSections = (): void => {
  if (expandedSections.value.size === 7) { // 总共有7个章节
    expandedSections.value.clear();
  } else {
    expandedSections.value = new Set([1, 2, 3, 4, 5, 6, 7]);
  }
};

// 同意协议并返回
const agreeAndReturn = (): void => {
  agreedToTerms.value = true;
  // 可以在这里添加同意协议的API调用
  // 返回上一页
  window.history.back();
};

// 打开协议弹窗
const openModal = (): void => {
  showAgreementModal.value = true;
};

// 关闭协议弹窗
const closeModal = (): void => {
  showAgreementModal.value = false;
};
</script>

<template>
  <!-- 背景视频 -->
  <video class="bg-video" autoplay loop muted playsinline>
    <source src="/videos/home1.mp4" type="video/mp4">
  </video>

  <!-- 主容器 -->
  <div class="agreement-container">
    <div class="content-wrapper">
      <!-- 返回按钮 -->
      <div class="back-section">
        <router-link to="/" class="back-button">
          <svg-icon name="home" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5"></path>
            <path d="M12 19l-7-7 7-7"></path>
            </svg-icon>
          返回
        </router-link>
      </div>

      <!-- 协议内容区域 -->
      <div class="agreement-content">
        <div class="agreement-header">
          <h1>用户协议</h1>
          <p class="last-updated">最后更新日期: 2025年3月1日</p>

          <div class="controls">
            <button class="control-btn" @click="toggleAllSections">
              {{ expandedSections.size === 7 ? '全部折叠' : '全部展开' }}
            </button>
            <button class="print-btn" @click="handlePrint">
              打印协议
            </button>
          </div>
        </div>

        <!-- 协议章节 -->
        <div class="agreement-sections">
          <!-- 第一章节 -->
          <div class="section">
            <div class="section-header" @click="toggleSection(1)">
              <h2>1. 协议条款与服务说明</h2>
              <span class="toggle-icon">{{ expandedSections.has(1) ? '−' : '+' }}</span>
            </div>
            <div class="section-content" v-show="expandedSections.has(1)">
              <p>欢迎您使用我们的服务。本协议是您与本平台之间关于用户使用本平台服务所订立的协议。</p>
              <p>1.1 在您注册成为本平台用户前，请您务必仔细阅读本协议的全部内容。如您不同意本协议的任意内容，请勿注册或使用本服务。如您点击"注册"按钮，即表示您已充分阅读、理解并接受本协议的全部内容。</p>
              <p>1.2 您确认，在您开始注册/使用本平台服务前，您应具备中华人民共和国法律规定的与您行为相适应的民事行为能力。若您不具备前述与您行为相适应的民事行为能力，则您及您的监护人应依照法律规定承担相应的责任。</p>
              <p>1.3 本平台有权根据需要不时地制订、修改本协议及/或各类规则，并以网站公示的方式进行公告，不再单独通知您。变更后的协议和规则一经在网站公布后，立即自动生效。</p>
            </div>
          </div>

          <!-- 第二章节 -->
          <div class="section">
            <div class="section-header" @click="toggleSection(2)">
              <h2>2. 账号注册与安全</h2>
              <span class="toggle-icon">{{ expandedSections.has(2) ? '−' : '+' }}</span>
            </div>
            <div class="section-content" v-show="expandedSections.has(2)">
              <p>2.1 用户在注册时应提供真实、准确、完整的个人资料，并在资料发生变更时及时更新。</p>
              <p>2.2 用户应妥善保管账号及密码信息，不得将账号提供给他人使用。因用户个人原因导致账号或密码泄露而造成的损失，由用户自行承担。</p>
              <p>2.3 如发现有人冒用或盗用您的账号及密码，或您的账号存在其他安全问题，您应立即通知本平台并请求暂停相关服务。</p>
              <p>2.4 本平台有权基于单方判断，对违反有关法律法规或本协议约定的用户账号进行暂停或终止服务。</p>
            </div>
          </div>

          <!-- 第三章节 -->
          <div class="section">
            <div class="section-header" @click="toggleSection(3)">
              <h2>3. 用户个人信息保护</h2>
              <span class="toggle-icon">{{ expandedSections.has(3) ? '−' : '+' }}</span>
            </div>
            <div class="section-content" v-show="expandedSections.has(3)">
              <p>3.1 保护用户个人信息是本平台的基本原则之一。本平台将按照本协议及《隐私政策》的规定收集、使用、存储和共享您的个人信息。</p>
              <p>3.2 本平台仅会出于以下目的收集和使用您的个人信息：</p>
              <ul>
                <li>向您提供服务及提升服务质量</li>
                <li>验证您的身份信息</li>
                <li>安全防范、诈骗监测</li>
                <li>遵守法律法规的要求</li>
                <li>经您授权的其他用途</li>
              </ul>
              <p>3.3 未经您的同意，本平台不会向任何第三方提供、公开或共享您的个人信息，但以下情况除外：</p>
              <ul>
                <li>获得您的明确授权</li>
                <li>基于法律法规的要求</li>
                <li>基于政府主管部门的要求</li>
                <li>为维护社会公共利益</li>
                <li>为维护本平台及其关联公司、本平台用户或雇员的合法权益</li>
              </ul>
            </div>
          </div>

          <!-- 第四章节 -->
          <div class="section">
            <div class="section-header" @click="toggleSection(4)">
              <h2>4. 用户行为规范</h2>
              <span class="toggle-icon">{{ expandedSections.has(4) ? '−' : '+' }}</span>
            </div>
            <div class="section-content" v-show="expandedSections.has(4)">
              <p>4.1 用户在使用本平台服务过程中，必须遵循以下原则：</p>
              <ul>
                <li>遵守中国有关法律法规</li>
                <li>遵守所有与网络服务有关的网络协议、规定和程序</li>
                <li>不得利用本平台进行任何可能对互联网正常运转造成不利影响的行为</li>
                <li>不得利用本平台服务上传、发布或传播任何违反国家法律法规的内容</li>
                <li>不得利用本平台服务进行任何不利于国家安全、荣誉和利益的行为</li>
              </ul>
              <p>4.2 用户不得利用本平台服务制作、上传、发布、传播如下内容：</p>
              <ul>
                <li>反对宪法确定的基本原则的</li>
                <li>危害国家安全，泄露国家秘密，颠覆国家政权，破坏国家统一的</li>
                <li>损害国家荣誉和利益的</li>
                <li>煽动民族仇恨、民族歧视，破坏民族团结的</li>
                <li>破坏国家宗教政策，宣扬邪教和封建迷信的</li>
                <li>散布谣言，扰乱社会秩序，破坏社会稳定的</li>
                <li>散布淫秽、色情、赌博、暴力、恐怖或者教唆犯罪的</li>
                <li>侮辱或者诽谤他人，侵害他人合法权益的</li>
                <li>含有法律、行政法规禁止的其他内容的</li>
              </ul>
            </div>
          </div>

          <!-- 第五章节 -->
          <div class="section">
            <div class="section-header" @click="toggleSection(5)">
              <h2>5. 知识产权</h2>
              <span class="toggle-icon">{{ expandedSections.has(5) ? '−' : '+' }}</span>
            </div>
            <div class="section-content" v-show="expandedSections.has(5)">
              <p>5.1 本平台所包含的全部智力成果，包括但不限于网站程序、网页设计、图表、图像、照片、文字描述等，其著作权、商标权及其他知识产权均归本平台所有，但用户发布的内容及相关权利除外。</p>
              <p>5.2 未经本平台事先书面同意，用户不得以任何方式使用本平台包含的商标、商号以及标识等知识产权。</p>
              <p>5.3 用户上传的内容，用户应确保对该等内容享有合法权利。因用户发布内容导致的知识产权纠纷由用户自行解决并承担全部法律责任。</p>
            </div>
          </div>

          <!-- 第六章节 -->
          <div class="section">
            <div class="section-header" @click="toggleSection(6)">
              <h2>6. 服务变更、中断或终止</h2>
              <span class="toggle-icon">{{ expandedSections.has(6) ? '−' : '+' }}</span>
            </div>
            <div class="section-content" v-show="expandedSections.has(6)">
              <p>6.1 本平台有权在需要时修改或中断服务。本平台不需事先通知用户即可修改或中断服务。</p>
              <p>6.2 如发生下列任何一种情形，本平台有权随时中断或终止向用户提供本协议项下的服务：</p>
              <ul>
                <li>用户提供的资料不真实</li>
                <li>用户违反本协议中规定的使用规则</li>
                <li>用户在使用付费服务时未按规定向本平台支付相应的服务费</li>
              </ul>
              <p>6.3 因系统维护、系统故障或其他原因导致的服务中断，本平台将尽最大努力及时恢复服务，但无需为此向用户承担任何责任。</p>
            </div>
          </div>

          <!-- 第七章节 -->
          <div class="section">
            <div class="section-header" @click="toggleSection(7)">
              <h2>7. 免责声明</h2>
              <span class="toggle-icon">{{ expandedSections.has(7) ? '−' : '+' }}</span>
            </div>
            <div class="section-content" v-show="expandedSections.has(7)">
              <p>7.1 用户明确同意其使用本平台服务所存在的风险将完全由其自己承担；因其使用本平台服务而产生的一切后果也由其自己承担。</p>
              <p>7.2 本平台对服务不提供任何明示或暗示的担保或保证，包括但不限于商业适售性、特定目的的适用性及非侵权性等的担保或保证。</p>
              <p>7.3 对于因不可抗力或本平台不能控制的原因造成的服务中断或其它缺陷，本平台不承担任何责任，但将尽力减少因此而给用户造成的损失和影响。</p>
              <p>7.4 本平台不保证服务一定能满足用户的要求，也不保证服务不会中断，对服务的及时性、安全性、准确性也都不作保证。</p>
            </div>
          </div>
        </div>

        <!-- 底部操作栏 -->
        <div class="agreement-actions">
          <div class="action-checkbox">
            <label class="checkbox-group">
              <input type="checkbox" v-model="agreedToTerms">
              <span class="custom-checkbox"></span>
              <span class="checkbox-label">我已阅读并同意上述用户协议的全部内容</span>
            </label>
          </div>
          <div class="action-buttons">
            <button class="cancel-btn" @click="$router.push('/')">取消</button>
            <button class="confirm-btn" :disabled="!agreedToTerms" @click="agreeAndReturn">
              确认同意
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 返回顶部按钮 -->
    <button class="back-to-top" @click="scrollToTop">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 19V5"></path>
        <path d="M5 12l7-7 7 7"></path>
      </svg>
    </button>
  </div>

  <!-- 协议弹窗 (移动端查看) -->
  <div class="agreement-modal" v-if="showAgreementModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>用户协议</h2>
        <button class="close-btn" @click="closeModal">×</button>
      </div>
      <div class="modal-body">
        <!-- 协议内容 (与主页面相同) -->
        <!-- 此处可复用上面的协议内容，为简洁起见省略 -->
      </div>
      <div class="modal-footer">
        <button class="cancel-btn" @click="closeModal">取消</button>
        <button class="confirm-btn" :disabled="!agreedToTerms" @click="agreeAndReturn">
          同意并继续
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 容器基础样式 */
.agreement-container {
  min-height: 100vh;
  padding: 0;
  position: relative;
}

/* 背景视频样式 */
.bg-video {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
}

/* 主要内容框架样式 */
.content-wrapper {
  width: 90%;
  max-width: 1200px;
  margin: 2rem auto;
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 2rem;
  position: relative;
  box-shadow: 0 15px 30px 0 rgba(51, 88, 104, 0.27);
}

/* 返回按钮区域 */
.back-section {
  margin-bottom: 1.5rem;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  text-decoration: none;
  font-size: 1rem;
  width: fit-content;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* 协议内容区域 */
.agreement-content {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 2rem;
  color: white;
}

.agreement-header {
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;
}

.agreement-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.last-updated {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.controls {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.control-btn, .print-btn {
  background: rgba(100, 104, 111, 0.3);
  border: none;
  border-radius: 8px;
  color: white;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-btn:hover, .print-btn:hover {
  background: rgba(100, 104, 111, 0.6);
}

/* 协议章节 */
.agreement-sections {
  margin-bottom: 2rem;
}

.section {
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.section-header:hover {
  color: rgba(255, 255, 255, 0.8);
}

.section-header h2 {
  font-size: 1.3rem;
  margin: 0;
}

.toggle-icon {
  font-size: 1.5rem;
  font-weight: bold;
}

.section-content {
  padding: 1rem 0 2rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
}

.section-content p {
  margin-bottom: 1rem;
}

.section-content ul {
  padding-left: 2rem;
  margin-bottom: 1rem;
}

.section-content ul li {
  margin-bottom: 0.5rem;
}

/* 底部操作栏 */
.agreement-actions {
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.action-checkbox {
  display: flex;
  align-items: center;
}
.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}
.cancel-btn, .confirm-btn {
  padding: 0.8rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.confirm-btn {
  background: rgba(100, 104, 111, 0.7);
  color: white;
  border: none;
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.confirm-btn:not(:disabled):hover {
  background: rgba(100, 104, 111, 0.9);
}

/* 复选框样式 */
.checkbox-group {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
  display: none;
}

.custom-checkbox {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 4px;
  margin-right: 8px;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox-group input[type="checkbox"]:checked + .custom-checkbox {
  background: rgb(100, 104, 111);
  border-color: transparent;
}

.checkbox-group input[type="checkbox"]:checked + .custom-checkbox::after {
  content: "✓";
  color: white;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 14px;
}

.checkbox-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
}

/* 返回顶部按钮 */
.back-to-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.back-to-top:hover {
  background: rgba(0, 0, 0, 0.7);
  transform: translateY(-3px);
}

/* 协议弹窗 */
.agreement-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  background: rgba(22, 28, 36, 0.95);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  color: white;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex-grow: 1;
  color: rgba(255, 255, 255, 0.8);
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-wrapper {
    width: 95%;
    padding: 1.5rem;
    margin: 1rem auto;
  }

  .agreement-content {
    padding: 1.5rem;
  }

  .agreement-header h1 {
    font-size: 1.5rem;
  }

  .section-header h2 {
    font-size: 1.1rem;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
  }

  .cancel-btn, .confirm-btn {
    width: 100%;
  }

  .back-to-top {
    width: 40px;
    height: 40px;
    bottom: 1rem;
    right: 1rem;
  }
}

/* 打印样式 */
@media print {
  .bg-video, .back-section, .controls, .agreement-actions, .back-to-top {
    display: none;
  }

  .content-wrapper {
    background: none;
    box-shadow: none;
    padding: 0;
    margin: 0;
    width: 100%;
  }

  .agreement-content {
    background: none;
    color: black;
    padding: 0;
  }

  .section-content {
    color: black;
    display: block !important;
  }

  .toggle-icon {
    display: none;
  }

  .section {
    break-inside: avoid;
  }
}
</style>
