import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  Row, 
  Col, 
  Typography,
  Avatar,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  message,
  Upload,
  Space
} from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { UserOutlined, CameraOutlined, UploadOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';

const { Title, Paragraph } = Typography;

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { user, setUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatar || '');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [form] = Form.useForm();

  const onEdit = () => {
    form.setFieldsValue({
      first_name: user?.first_name,
      last_name: user?.last_name,
      phone: user?.phone,
    });
    setOpen(true);
  };

  const onSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // 调用更新接口
      const response = await userAPI.updateProfile(values);
      
      // 更新本地用户数据
      const updatedUser = { ...user, ...values };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // 显示成功提示
      message.success(t('profile.updateSuccess'));
      setOpen(false);
    } catch (error: any) {
      console.error('Update profile error:', error);
      // 显示错误提示
      message.error(error.message || t('profile.updateError'));
    } finally {
      setLoading(false);
    }
  };

  // 处理头像上传前的验证
  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error(t('profile.imageOnly'));
      return false;
    }
    
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error(t('profile.imageSizeLimit'));
      return false;
    }
    
    return false; // 返回 false 阻止自动上传，我们手动处理
  };

  // 处理文件变化
  const handleFileChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList);
    
    // 生成预览图
    if (newFileList.length > 0) {
      const file = newFileList[0].originFileObj;
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setPreviewImage('');
    }
  };

  // 上传头像
  const handleAvatarUpload = async () => {
    if (fileList.length === 0) {
      message.warning(t('profile.selectImage'));
      return;
    }

    try {
      setLoading(true);
      
      // 使用 FormData 上传文件
      const formData = new FormData();
      const file = fileList[0].originFileObj;
      if (file) {
        formData.append('avatar', file);
      }
      
      // 调用上传接口
      const response = await userAPI.uploadAvatar(formData);
      
      // 更新本地用户数据
      const updatedUser = { ...user, avatar: response.avatar };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setAvatarUrl(response.avatar);
      
      message.success(t('profile.avatarUpdateSuccess'));
      setAvatarModalOpen(false);
      setFileList([]);
      setPreviewImage('');
    } catch (error: any) {
      console.error('Upload avatar error:', error);
      message.error(error.message || t('profile.avatarUpdateError'));
    } finally {
      setLoading(false);
    }
  };

  // 移除头像
  const handleRemoveAvatar = async () => {
    try {
      setLoading(true);
      
      // 调用后端删除头像
      await userAPI.removeAvatar();
      
      const updatedUser = { ...user, avatar: '' };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setAvatarUrl('');
      
      message.success(t('profile.avatarRemoved'));
      setAvatarModalOpen(false);
    } catch (error: any) {
      console.error('Remove avatar error:', error);
      message.error(t('profile.avatarRemoveError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[24, 24]}>
        <Col span={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Avatar 
                  size={100} 
                  icon={<UserOutlined />}
                  src={avatarUrl || user?.avatar}
                />
                <Button
                  type="primary"
                  shape="circle"
                  icon={<CameraOutlined />}
                  size="small"
                  onClick={() => setAvatarModalOpen(true)}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                  title={t('profile.changeAvatar')}
                />
              </div>
              <Title level={3} style={{ marginTop: '16px' }}>
                {user?.first_name} {user?.last_name}
              </Title>
              <Tag color="blue">{user?.role === 'volunteer' ? t('auth.volunteer') : user?.role === 'organizer' ? t('auth.organizer') : t('auth.admin')}</Tag>
            </div>
          </Card>
        </Col>
        
        <Col span={16}>
          <Card title={t('profile.information')}>
            <Paragraph>
              <strong>{t('profile.email')}:</strong> {user?.email}
            </Paragraph>
            <Paragraph>
              <strong>{t('profile.phone')}:</strong> {user?.phone || t('profile.notProvided')}
            </Paragraph>
            
            <Button type="primary" onClick={onEdit}>
              {t('profile.edit')}
            </Button>
          </Card>
        </Col>
      </Row>

      {/* 编辑资料 Modal */}
      <Modal 
        open={open} 
        onCancel={() => setOpen(false)} 
        onOk={onSubmit} 
        title={t('profile.editProfile')}
        confirmLoading={loading}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
      >
        <Form layout="vertical" form={form}>
          <Form.Item 
            label={t('auth.firstName')} 
            name="first_name"
            rules={[{ required: true, message: t('auth.firstNameRequired') }]}
          >
            <Input placeholder={t('auth.firstName')} />
          </Form.Item>
          <Form.Item 
            label={t('auth.lastName')} 
            name="last_name"
            rules={[{ required: true, message: t('auth.lastNameRequired') }]}
          >
            <Input placeholder={t('auth.lastName')} />
          </Form.Item>
          <Form.Item label={t('auth.phone')} name="phone">
            <Input placeholder={t('auth.phone')} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 上传头像 Modal */}
      <Modal
        open={avatarModalOpen}
        onCancel={() => {
          setAvatarModalOpen(false);
          setFileList([]);
          setPreviewImage('');
        }}
        onOk={handleAvatarUpload}
        title={t('profile.changeAvatar')}
        confirmLoading={loading}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
        width={500}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* 当前头像预览 */}
          <div style={{ textAlign: 'center' }}>
            <Avatar 
              size={120} 
              icon={<UserOutlined />}
              src={previewImage || avatarUrl || user?.avatar}
            />
          </div>

          {/* 上传组件 */}
          <Upload
            listType="picture-card"
            fileList={fileList}
            beforeUpload={beforeUpload}
            onChange={handleFileChange}
            onRemove={() => {
              setFileList([]);
              setPreviewImage('');
            }}
            maxCount={1}
            accept="image/*"
          >
            {fileList.length === 0 && (
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>{t('profile.uploadImage')}</div>
              </div>
            )}
          </Upload>

          {/* 移除头像按钮 */}
          {(avatarUrl || user?.avatar) && (
            <Button 
              danger 
              block 
              onClick={handleRemoveAvatar}
              loading={loading}
            >
              {t('profile.removeAvatar')}
            </Button>
          )}

          <div style={{ color: '#999', fontSize: '12px' }}>
            {t('profile.avatarHint')}
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default ProfilePage;