import {LockOutlined, UserOutlined,} from '@ant-design/icons';
import {message, Tabs} from 'antd';
import React, {useState} from 'react';
import Footer from '@/components/Footer';
import {history} from '@umijs/max';
import {userRegisterUsingPost} from '@/services/yubi/userController';
import {LoginForm, ProFormText} from '@ant-design/pro-form';
import {Helmet, Link} from "@@/exports";
import Settings from "../../../../config/defaultSettings";
import {createStyles} from "antd-style";

const useStyles = createStyles(({ token }) => {
  return {
    action: {
      marginLeft: '8px',
      color: 'rgba(0, 0, 0, 0.2)',
      fontSize: '24px',
      verticalAlign: 'middle',
      cursor: 'pointer',
      transition: 'color 0.3s',
      '&:hover': {
        color: token.colorPrimaryActive,
      },
    },
    lang: {
      width: 42,
      height: 42,
      lineHeight: '42px',
      position: 'fixed',
      right: 16,
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      backgroundImage:
        "url('https://alist.yyyai.xyz/d/picture/BIpicture/Blue-Fade-PNG-Clipart.png?sign=fycpv6XHhb_16wOJ_s0JXjqiV2D85kar6ulhE9i0ZzI=:0')",
      backgroundSize: '100% 100%',
    },
    loginWrapper: {
      position: 'relative',
      zIndex: 1,
      flex: 1,
      padding: '32px 0',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    loginFormContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(12px)',
      borderRadius: token.borderRadiusLG,
      padding: '40px',
      boxShadow: token.boxShadow,
      border: '1px solid rgba(255, 255, 255, 0.3)',
      minWidth: 280,
      maxWidth: '75vw',
    },
    footer: {
      flexShrink: 0, // 防止页脚被压缩
      position: 'relative',
      bottom: 50,
      zIndex: 1,
    },
  };
});
const Register: React.FC = () => {
  const [type, setType] = useState<string>('account');
  const { styles } = useStyles();
  // 表单提交
  const handleSubmit = async (values: API.UserRegisterRequest) => {
    const {userPassword, checkPassword} = values;
    // 校验
    if (userPassword !== checkPassword) {
      message.error('两次输入的密码不一致');
      return;
    }

    try {
      // 注册
      const res = await userRegisterUsingPost(values);
      if (res.message === 'ok') {
        const defaultLoginSuccessMessage = '注册成功！';
        message.success(defaultLoginSuccessMessage);
        /** 此方法会跳转到 redirect 参数所在的位置 */
        if (!history) return;
        const {query} = history.location;
        history.push({
          pathname: '/user/login',
          query,
        });
        return;
      }
      else {
          message.error('注册失败,' + `${res.message}`);
          return;
      }
    } catch (error: any) {
      const defaultLoginFailureMessage = '注册失败，请重试！';
      message.error(defaultLoginFailureMessage);
    }
  };

  return (
      <div className={styles.container}>
        <Helmet>
          <title>
            {'注册'}- {Settings.title}
          </title>
        </Helmet>
        <div
            style={{
              flex: '1',
              padding: '32px 0',
            }}
        >
          <div className={styles.loginWrapper}>
            <div className={styles.loginFormContainer}>
              <LoginForm
                submitter={{
                  searchConfig: {
                    submitText: '注册'
                  }
                }}
                contentStyle={{
                  minWidth: 280,
                  maxWidth: '75vw',
                }}
                logo={<img alt="logo" src="/logo.svg" />}
                title="智能数据分析"
                subTitle={'智能数据分析 是集合AIGC技术生成图表图文信息的应用'}
                onFinish={async (values) => {
                  await handleSubmit(values as API.UserLoginRequest);
                }}
              >
                <Tabs
                  activeKey={type}
                  onChange={setType}
                  centered
                  items={[
                    {
                      key: 'account',
                      label: '账户密码注册',
                    },
                  ]}
                />
                {type === 'account' && (
                  <>
                    <ProFormText
                      name="userAccount"
                      fieldProps={{
                        size: 'large',
                        prefix: <UserOutlined />,
                      }}
                      placeholder={'请输入用户名'}
                      rules={[
                        {
                          required: true,
                          message: '账号是必填项！',
                        },
                      ]}
                    />
                    <ProFormText.Password
                      name="userPassword"
                      fieldProps={{
                        size: 'large',
                        prefix: <LockOutlined />,
                      }}
                      placeholder={'请输入密码'}
                      rules={[
                        {
                          required: true,
                          message: '密码是必填项！',
                        },
                      ]}
                    />
                    <ProFormText.Password
                      name="checkPassword"
                      fieldProps={{
                        size: 'large',
                        prefix: <LockOutlined />,
                      }}
                      placeholder={'请重新输入密码'}
                      rules={[
                        {
                          required: true,
                          message: '检验密码是必填项！',
                        },
                      ]}
                    />
                  </>
                )}
                <div
                  style={{
                    marginBottom: 24,
                  }}
                >
                  <Link to="/user/login">已有账号？去登录</Link>
                </div>
              </LoginForm>
            </div>
          </div>
        </div>
        <div className={styles.footer}>
          <Footer />
        </div>
      </div>
  );
};

export default Register;
