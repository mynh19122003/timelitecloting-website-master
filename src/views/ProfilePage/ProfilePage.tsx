"use client";

/* eslint-disable @next/next/no-img-element */

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiEdit2,
  FiMail,
  FiPhone,
  FiMapPin,
  FiLogOut,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiCreditCard,
  FiDollarSign,
  FiFilter,
  FiChevronDown,
  FiUser,
  FiCalendar,
  FiLock,
  FiBell,
  FiHome,
  FiShoppingBag,
} from "react-icons/fi";
import { orderStatusLabels, OrderStatus } from "../../data/orders";
import { useAuth } from "../../context/AuthContext";
import { useI18n } from "../../context/I18nContext";
import { formatCurrency } from "../../utils/currency";
import { ApiService, ApiError } from "../../services/api";
import CountryPhoneInput from "react-country-phone-input";
import "react-country-phone-input/lib/style.css";
import styles from "./ProfilePage.module.css";

type Profile = {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other" | "";
  membership: "Platinum" | "Gold" | "Silver";
  avatar: string;
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
  };
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type ProfileErrors = Partial<Record<keyof Profile, string>>;
type PasswordErrors = Partial<Record<keyof PasswordForm, string>>;

type ProfileTabKey = "profile" | "orders";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const statusClassMap: Record<OrderStatus, string> = {
  pending: "statusPending",
  processing: "statusProcessing",
  shipped: "statusShipped",
  delivered: "statusDelivered",
  cancelled: "statusCancelled",
};

// Validation functions will be moved inside component to use translations

type ProfileTabProps = {
  profile: Profile;
  formState: Profile;
  handleInputChange: (field: keyof Profile, value: string | Profile["notificationPreferences"]) => void;
  errors: ProfileErrors;
  isEditing: boolean;
  handleEditToggle: () => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  message: string | null;
  onSignOut: () => void;
  passwordForm: PasswordForm;
  passwordErrors: PasswordErrors;
  handlePasswordChange: (field: keyof PasswordForm, value: string) => void;
  handlePasswordSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isChangingPassword: boolean;
  setIsChangingPassword: (value: boolean) => void;
};

const ProfileTab = ({
  profile,
  formState,
  handleInputChange,
  errors,
  isEditing,
  handleEditToggle,
  handleSubmit,
  message,
  onSignOut,
  passwordForm,
  passwordErrors,
  handlePasswordChange,
  handlePasswordSubmit,
  isChangingPassword,
  setIsChangingPassword,
}: ProfileTabProps) => {
  const { t } = useI18n();
  
  const handleNotificationToggle = (key: keyof Profile["notificationPreferences"]) => {
    handleInputChange("notificationPreferences", {
      ...formState.notificationPreferences,
      [key]: !formState.notificationPreferences[key],
    });
  };

  return (
    <div className={styles.profileTab}>
      <div className={styles.leftColumn}>
        <div className={styles.mainInfo}>
          <div className={styles.avatarContainer}>
            <img src={profile.avatar} alt={profile.name || "Guest"} className={styles.avatar} />
            <button className={styles.avatarUploadButton} type="button" title={t("profile.change.avatar")}>
              <FiEdit2 />
            </button>
          </div>
          <div className={styles.profileInfo}>
            <h2 className={styles.profileName}>{profile.name || "Guest User"}</h2>
            <p className={styles.profileMembership}>
              <FiShoppingBag className={styles.membershipIcon} />
              Membership {profile.membership}
            </p>
          </div>
        </div>
        <button type="button" className={styles.signOutButton} onClick={onSignOut}>
          <FiLogOut className={styles.editIcon} />
          Sign out
        </button>
      </div>
      <div className={styles.rightColumn}>
        <div className={styles.details}>
          {message && <div className={styles.successMessage}>{message}</div>}
          
          {isEditing ? (
            <form className={styles.editForm} onSubmit={handleSubmit} noValidate>
              {/* Personal Information Section */}
              <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <FiUser className={styles.sectionIcon} />
                  <h3 className={styles.sectionTitle}>Personal Information</h3>
                </div>
              <div className={styles.formGrid}>
                <label className={styles.formField}>
                  <span>Full name</span>
                  <input
                    type="text"
                    value={formState.name}
                    onChange={(event) => handleInputChange("name", event.target.value)}
                    className={`${styles.formInput} ${errors.name ? styles.formInputError : ""}`.trim()}
                      placeholder={t("profile.enter.full.name")}
                  />
                  {errors.name && <p className={styles.errorText}>{errors.name}</p>}
                </label>
                  <label className={styles.formField}>
                    <span>{t("profile.date.of.birth")}</span>
                    <div className={styles.inputWithIcon}>
                      <FiCalendar className={styles.inputIcon} />
                      <input
                        type="date"
                        value={formState.dateOfBirth}
                        onChange={(event) => handleInputChange("dateOfBirth", event.target.value)}
                        className={styles.formInput}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </label>
                  <label className={styles.formField}>
                    <span>{t("profile.gender")}</span>
                    <select
                      value={formState.gender}
                      onChange={(event) => handleInputChange("gender", event.target.value)}
                      className={styles.formSelect}
                    >
                      <option value="">{t("profile.select.gender")}</option>
                      <option value="male">{t("profile.gender.male")}</option>
                      <option value="female">{t("profile.gender.female")}</option>
                      <option value="other">{t("profile.gender.other")}</option>
                    </select>
                  </label>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <FiMail className={styles.sectionIcon} />
                  <h3 className={styles.sectionTitle}>{t("profile.contact.info")}</h3>
                </div>
                <div className={styles.formGrid}>
                <label className={styles.formField}>
                  <span>{t("profile.email")}</span>
                    <div className={styles.inputWithIcon}>
                      <FiMail className={styles.inputIcon} />
                  <input
                    type="email"
                    value={formState.email}
                    onChange={(event) => handleInputChange("email", event.target.value)}
                    className={`${styles.formInput} ${errors.email ? styles.formInputError : ""}`.trim()}
                        placeholder="your.email@example.com"
                  />
                    </div>
                  {errors.email && <p className={styles.errorText}>{errors.email}</p>}
                </label>
                <label className={styles.formField}>
                  <span>{t("profile.phone.number")}</span>
                  <div className={styles.phoneInputWrapper}>
                    <CountryPhoneInput
                      value={formState.phone}
                      onChange={(value: string) => {
                        handleInputChange("phone", value);
                      }}
                      placeholder={t("profile.enter.phone")}
                      enableSearch={true}
                    />
                  </div>
                  {errors.phone && <p className={styles.errorText}>{errors.phone}</p>}
                </label>
                </div>
              </div>

              {/* Address Information Section */}
              <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <FiHome className={styles.sectionIcon} />
                  <h3 className={styles.sectionTitle}>{t("profile.address.info")}</h3>
                </div>
                <div className={styles.formGrid}>
                  <label className={`${styles.formField} ${styles.formFieldFull}`}>
                    <span>{t("profile.street.address")}</span>
                    <div className={styles.inputWithIcon}>
                      <FiMapPin className={styles.inputIcon} />
                      <input
                        type="text"
                        value={formState.street}
                        onChange={(event) => handleInputChange("street", event.target.value)}
                        className={styles.formInput}
                        placeholder={t("profile.enter.street")}
                      />
                    </div>
                    {errors.street && <p className={styles.errorText}>{errors.street}</p>}
                  </label>
                <label className={styles.formField}>
                    <span>{t("profile.city")}</span>
                    <input
                      type="text"
                      value={formState.city}
                      onChange={(event) => handleInputChange("city", event.target.value)}
                      className={styles.formInput}
                      placeholder={t("profile.enter.city")}
                    />
                    {errors.city && <p className={styles.errorText}>{errors.city}</p>}
                  </label>
                  <label className={styles.formField}>
                    <span>{t("profile.state.province")}</span>
                    <input
                      type="text"
                      value={formState.state}
                      onChange={(event) => handleInputChange("state", event.target.value)}
                      className={styles.formInput}
                      placeholder={t("profile.enter.state")}
                    />
                    {errors.state && <p className={styles.errorText}>{errors.state}</p>}
                  </label>
                  <label className={styles.formField}>
                    <span>{t("profile.zip.postal")}</span>
                    <input
                      type="text"
                      value={formState.zipCode}
                      onChange={(event) => handleInputChange("zipCode", event.target.value)}
                      className={styles.formInput}
                      placeholder={t("profile.enter.zip")}
                    />
                    {errors.zipCode && <p className={styles.errorText}>{errors.zipCode}</p>}
                  </label>
                  <label className={styles.formField}>
                    <span>{t("profile.country")}</span>
                    <input
                      type="text"
                      value={formState.country}
                      onChange={(event) => handleInputChange("country", event.target.value)}
                      className={styles.formInput}
                      placeholder={t("profile.enter.country")}
                    />
                    {errors.country && <p className={styles.errorText}>{errors.country}</p>}
                </label>
              </div>
              </div>

              {/* Notification Preferences Section */}
              <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <FiBell className={styles.sectionIcon} />
                  <h3 className={styles.sectionTitle}>{t("profile.notification.preferences")}</h3>
                </div>
                <div className={styles.preferencesGrid}>
                  <label className={styles.preferenceItem}>
                    <input
                      type="checkbox"
                      checked={formState.notificationPreferences.email}
                      onChange={() => handleNotificationToggle("email")}
                      className={styles.checkbox}
                    />
                    <span>Email notifications</span>
                  </label>
                  <label className={styles.preferenceItem}>
                    <input
                      type="checkbox"
                      checked={formState.notificationPreferences.sms}
                      onChange={() => handleNotificationToggle("sms")}
                      className={styles.checkbox}
                    />
                    <span>SMS notifications</span>
                  </label>
                  <label className={styles.preferenceItem}>
                    <input
                      type="checkbox"
                      checked={formState.notificationPreferences.push}
                      onChange={() => handleNotificationToggle("push")}
                      className={styles.checkbox}
                    />
                    <span>Push notifications</span>
                  </label>
                  <label className={styles.preferenceItem}>
                    <input
                      type="checkbox"
                      checked={formState.notificationPreferences.marketing}
                      onChange={() => handleNotificationToggle("marketing")}
                      className={styles.checkbox}
                    />
                    <span>Marketing emails</span>
                  </label>
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelButton} onClick={handleEditToggle}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveButton}>
                  Save changes
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Personal Information View */}
              <div className={styles.infoSection}>
                <div className={styles.sectionHeader}>
                  <FiUser className={styles.sectionIcon} />
                  <h3 className={styles.sectionTitle}>Personal Information</h3>
                </div>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <FiUser className={styles.detailIcon} />
                    <div>
                      <p className={styles.detailLabel}>Full name</p>
                      <p className={styles.detailValue}>{profile.name || "Not set"}</p>
                    </div>
                  </div>
                  {profile.dateOfBirth && (
                    <div className={styles.detailItem}>
                      <FiCalendar className={styles.detailIcon} />
                      <div>
                        <p className={styles.detailLabel}>Date of Birth</p>
                        <p className={styles.detailValue}>
                          {new Date(profile.dateOfBirth).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                  {profile.gender && (
                    <div className={styles.detailItem}>
                      <FiUser className={styles.detailIcon} />
                      <div>
                        <p className={styles.detailLabel}>Gender</p>
                        <p className={styles.detailValue}>
                          {profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information View */}
              <div className={styles.infoSection}>
                <div className={styles.sectionHeader}>
                  <FiMail className={styles.sectionIcon} />
                  <h3 className={styles.sectionTitle}>{t("profile.contact.info")}</h3>
                </div>
                <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <FiMail className={styles.detailIcon} />
                <div>
                  <p className={styles.detailLabel}>Email</p>
                  <p className={styles.detailValue}>{profile.email}</p>
                </div>
              </div>
                  {profile.phone && (
              <div className={styles.detailItem}>
                <FiPhone className={styles.detailIcon} />
                <div>
                  <p className={styles.detailLabel}>Phone</p>
                  <p className={styles.detailValue}>{profile.phone}</p>
                </div>
              </div>
                  )}
                </div>
              </div>

              {/* Address Information View */}
              <div className={styles.infoSection}>
                <div className={styles.sectionHeader}>
                  <FiHome className={styles.sectionIcon} />
                  <h3 className={styles.sectionTitle}>{t("profile.address.info")}</h3>
                </div>
                <div className={styles.detailGrid}>
                  {(profile.street || profile.city || profile.state || profile.zipCode || profile.country) && (
                    <div className={`${styles.detailItem} ${styles.formFieldFull}`}>
                <FiMapPin className={styles.detailIcon} />
                      <div className={styles.addressDetails}>
                        {profile.street && <p className={styles.detailValue}>{profile.street}</p>}
                        <div className={styles.addressLine}>
                          {profile.city && <span className={styles.detailValue}>{profile.city}</span>}
                          {profile.city && profile.state && <span className={styles.addressSeparator}>, </span>}
                          {profile.state && <span className={styles.detailValue}>{profile.state}</span>}
                          {profile.zipCode && <span className={styles.detailValue}> {profile.zipCode}</span>}
                </div>
                        {profile.country && <p className={styles.detailValue}>{profile.country}</p>}
              </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notification Preferences View */}
              {Object.values(profile.notificationPreferences).some(v => v) && (
                <div className={styles.infoSection}>
                  <div className={styles.sectionHeader}>
                    <FiBell className={styles.sectionIcon} />
                    <h3 className={styles.sectionTitle}>{t("profile.notification.preferences")}</h3>
                  </div>
                  <div className={styles.preferencesList}>
                    {profile.notificationPreferences.email && (
                      <span className={styles.preferenceBadge}>Email</span>
                    )}
                    {profile.notificationPreferences.sms && (
                      <span className={styles.preferenceBadge}>SMS</span>
                    )}
                    {profile.notificationPreferences.push && (
                      <span className={styles.preferenceBadge}>Push</span>
                    )}
                    {profile.notificationPreferences.marketing && (
                      <span className={styles.preferenceBadge}>Marketing</span>
                    )}
                  </div>
                </div>
              )}

              <div className={styles.editHint}>
                <button className={styles.editButton} onClick={handleEditToggle} type="button">
                  <FiEdit2 className={styles.editIcon} />
                  Edit profile
                </button>
              </div>
            </>
          )}

          {/* Password Change Section */}
          <div className={styles.infoSection}>
            <div className={styles.sectionHeader}>
              <FiLock className={styles.sectionIcon} />
              <h3 className={styles.sectionTitle}>Security</h3>
            </div>
            {isChangingPassword ? (
              <form className={styles.passwordForm} onSubmit={handlePasswordSubmit} noValidate>
                <div className={styles.formGrid}>
                  <label className={styles.formField}>
                    <span>{t("profile.password.current")}</span>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(event) => handlePasswordChange("currentPassword", event.target.value)}
                      className={`${styles.formInput} ${passwordErrors.currentPassword ? styles.formInputError : ""}`.trim()}
                      placeholder={t("profile.enter.current.password")}
                    />
                    {passwordErrors.currentPassword && (
                      <p className={styles.errorText}>{passwordErrors.currentPassword}</p>
                    )}
                  </label>
                  <label className={styles.formField}>
                    <span>{t("profile.password.new")}</span>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(event) => handlePasswordChange("newPassword", event.target.value)}
                      className={`${styles.formInput} ${passwordErrors.newPassword ? styles.formInputError : ""}`.trim()}
                      placeholder={t("profile.enter.new.password")}
                    />
                    {passwordErrors.newPassword && (
                      <p className={styles.errorText}>{passwordErrors.newPassword}</p>
                    )}
                  </label>
                  <label className={styles.formField}>
                    <span>Confirm new password</span>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(event) => handlePasswordChange("confirmPassword", event.target.value)}
                      className={`${styles.formInput} ${passwordErrors.confirmPassword ? styles.formInputError : ""}`.trim()}
                      placeholder={t("profile.confirm.new.password")}
                    />
                    {passwordErrors.confirmPassword && (
                      <p className={styles.errorText}>{passwordErrors.confirmPassword}</p>
                    )}
                  </label>
        </div>
                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => setIsChangingPassword(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.saveButton}>
                    Change password
                  </button>
                </div>
              </form>
            ) : (
              <div className={styles.passwordAction}>
                <p className={styles.passwordHint}>Keep your account secure with a strong password</p>
                <button
                  type="button"
                  className={styles.changePasswordButton}
                  onClick={() => setIsChangingPassword(true)}
                >
                  <FiLock className={styles.editIcon} />
                  Change password
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface OrderHistoryItem {
  id: string | number;
  orderNumber: string;
  status: OrderStatus;
  placedAt: string;
  expectedDelivery?: string;
  total: number;
  shippingFee: number;
  subtotal: number;
  paymentMethod: string;
  items: Array<{
    id: string | number;
    name: string;
    image: string;
    color: string;
    size: string;
    price: number;
    quantity: number;
  }>;
}

// Helper function to get status icon
const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case "pending":
      return <FiPackage className={styles.statusIcon} />;
    case "processing":
      return <FiPackage className={styles.statusIcon} />;
    case "shipped":
      return <FiTruck className={styles.statusIcon} />;
    case "delivered":
      return <FiCheckCircle className={styles.statusIcon} />;
    case "cancelled":
      return <FiXCircle className={styles.statusIcon} />;
    default:
      return <FiPackage className={styles.statusIcon} />;
  }
};

// Helper function to get payment method icon and label
const getPaymentMethodDisplay = (method: string) => {
  const normalizedMethod = method.toLowerCase().replace(/[_\s-]/g, '');
  
  if (normalizedMethod.includes('bank') || normalizedMethod.includes('transfer')) {
    return {
      icon: <FiCreditCard className={styles.paymentIcon} />,
      label: 'Bank Transfer',
      className: styles.paymentBank
    };
  } else if (normalizedMethod.includes('cod') || normalizedMethod.includes('cash')) {
    return {
      icon: <FiDollarSign className={styles.paymentIcon} />,
      label: 'Cash on Delivery',
      className: styles.paymentCod
    };
  } else {
    return {
      icon: <FiCreditCard className={styles.paymentIcon} />,
      label: method,
      className: styles.paymentOther
    };
  }
};

const OrderHistoryTab = ({ 
  orderHistory, 
  isLoadingOrders 
}: { 
  orderHistory: OrderHistoryItem[]; 
  isLoadingOrders: boolean;
}) => {
  const { t } = useI18n();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  if (isLoadingOrders) {
    return (
      <div>
        <h2 className={styles.tabTitle}>Order History</h2>
        <div className={styles.orderEmpty}>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  // Safety check: ensure orderHistory is an array
  if (!orderHistory || !Array.isArray(orderHistory) || orderHistory.length === 0) {
    return (
      <div>
        <h2 className={styles.tabTitle}>Order History</h2>
        <div className={styles.orderEmpty}>
          <p>No orders yet.</p>
        </div>
      </div>
    );
  }

  // Filter and sort orders
  let filteredOrders = [...orderHistory];
  
  // Apply status filter
  if (statusFilter !== "all") {
    filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
  }
  
  // Apply sort
  filteredOrders.sort((a, b) => {
    const dateA = new Date(a.placedAt).getTime();
    const dateB = new Date(b.placedAt).getTime();
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  return (
    <div>
      <div className={styles.orderHistoryHeader}>
        <h2 className={styles.tabTitle}>Order History</h2>
        
        <div className={styles.filterControls}>
          {/* Status Filter */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              <FiFilter className={styles.filterIcon} />
              <span>Status:</span>
            </label>
            <div className={styles.selectWrapper}>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
                className={styles.filterSelect}
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <FiChevronDown className={styles.selectIcon} />
            </div>
          </div>

          {/* Sort Order */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              <span>Sort by:</span>
            </label>
            <div className={styles.selectWrapper}>
              <select 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
                className={styles.filterSelect}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
              <FiChevronDown className={styles.selectIcon} />
            </div>
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className={styles.orderEmpty}>
          <p>No orders found with the selected filters.</p>
        </div>
      ) : (
        <div className={styles.orderList}>
          {filteredOrders.map((order) => {
          const statusClassName = styles[statusClassMap[order.status]];
          const shippingLabel =
            order.shippingFee === 0 ? "Complimentary shipping" : formatCurrency(order.shippingFee);
          const isCancelled = order.status === "cancelled";
          const paymentDisplay = getPaymentMethodDisplay(order.paymentMethod);

          return (
            <article key={order.id} className={styles.orderCard}>
              <header className={styles.orderHeader}>
                <div className={styles.orderHeaderLeft}>
                  <p className={styles.orderNumber}>{order.orderNumber}</p>
                  <p className={styles.orderMeta}>
                    Placed on {formatDate(order.placedAt)}
                  </p>
                </div>
                <div className={styles.orderHeaderRight}>
                  <span className={`${styles.orderStatus} ${statusClassName ?? ""}`.trim()}>
                    {getStatusIcon(order.status)}
                    <span>{orderStatusLabels[order.status]}</span>
                  </span>
                  <p className={styles.orderTotal}>{formatCurrency(order.total)}</p>
                </div>
              </header>

              <ul className={styles.orderItems}>
                {order.items.map((item) => (
                  <li key={`${order.id}-${item.id}`} className={styles.orderItem}>
                    <img src={item.image} alt={item.name} className={styles.orderItemImage} />
                    <div className={styles.orderItemInfo}>
                      <p className={styles.orderItemName}>{item.name}</p>
                      <p className={styles.orderItemMeta}>
                        Color: {item.color} - Size: {item.size}
                      </p>
                    </div>
                    <div className={styles.orderItemSummary}>
                      <p className={styles.orderItemPrice}>
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                      <p className={styles.orderItemQuantity}>{t("profile.order.qty")} {item.quantity}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <footer className={styles.orderFooter}>
                <div className={styles.orderFooterLeft}>
                  <p className={styles.orderFooterText}>
                    {t("profile.order.subtotal")} {formatCurrency(order.subtotal)} - {shippingLabel}
                  </p>
                </div>
                <div className={styles.orderFooterRight}>
                  <div className={`${styles.paymentBadge} ${paymentDisplay.className}`.trim()}>
                    {paymentDisplay.icon}
                    <span>{paymentDisplay.label}</span>
                  </div>
                </div>
              </footer>
              {isCancelled && (
                <p className={styles.orderNote}>
                  {t("profile.order.cancelled")}
                </p>
              )}
            </article>
          );
        })}
        </div>
      )}
    </div>
  );
};

export const ProfilePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();
  const { t } = useI18n();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setEditing] = useState(false);
  const [formState, setFormState] = useState<Profile | null>(null);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTabKey>("profile");
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Validation functions with translations
  const validateProfile = (profile: Profile): ProfileErrors => {
    const nextErrors: ProfileErrors = {};
    if (!profile.email.trim()) {
      nextErrors.email = t("error.email.required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      nextErrors.email = t("error.email.invalid");
    }
    return nextErrors;
  };

  const validatePassword = (passwordForm: PasswordForm): PasswordErrors => {
    const nextErrors: PasswordErrors = {};
    if (!passwordForm.currentPassword.trim()) {
      nextErrors.currentPassword = t("error.password.current.required");
    }
    if (!passwordForm.newPassword.trim()) {
      nextErrors.newPassword = t("error.password.new.required");
    } else if (passwordForm.newPassword.length < 6) {
      nextErrors.newPassword = t("error.password.min");
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      nextErrors.confirmPassword = t("auth.register.confirm.match");
    }
    return nextErrors;
  };

  // Load profile from API with token
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        console.log('[ProfilePage] No user, redirecting to login');
        navigate('/login', { replace: true });
        return;
      }

      try {
        setIsLoadingProfile(true);
        console.log('[ProfilePage] Loading profile for user:', user.email);
        
        // API call will automatically include token from localStorage
        const profileData = await ApiService.getProfile();
        console.log('[ProfilePage] Profile loaded:', profileData);
        
        // Parse address if it exists (for backward compatibility)
        const addressParts = profileData.address ? profileData.address.split(',').map(s => s.trim()) : [];
        const userProfile: Profile = {
          name: profileData.name || "",
          email: profileData.email,
          phone: profileData.phone || "",
          street: addressParts[0] || "",
          city: addressParts[1] || "",
          state: addressParts[2] || "",
          zipCode: addressParts[3] || "",
          country: addressParts[4] || "",
          dateOfBirth: "",
          gender: "",
          membership: "Platinum",
          avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
          notificationPreferences: {
            email: true,
            sms: false,
            push: false,
            marketing: false,
          },
        };
        
        setProfile(userProfile);
        setFormState(userProfile);
      } catch (error) {
        console.error('[ProfilePage] Failed to load profile:', error);
        setMessage(t("error.load.profile"));
        
        // If 401, user needs to login again
        if (error instanceof ApiError && error.status === 401) {
          console.log('[ProfilePage] Token invalid/expired, redirecting to login');
          logout();
          navigate('/login', { replace: true });
        }
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, [user, navigate, logout]);

  // Load order history when orders tab is active
  useEffect(() => {
    if (activeTab === "orders" && user) {
      loadOrderHistory();
    }
  }, [activeTab, user]);

  // Handle tab switching from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    if (tabParam === "orders") {
      setActiveTab("orders");
    } else {
      setActiveTab("profile");
    }
  }, [location.search]);

  // Handle success message from order creation
  useEffect(() => {
    if (location.state && 'message' in location.state) {
      setMessage(location.state.message as string);
      // Clear the message after 5 seconds
      const timer = setTimeout(() => setMessage(null), 5000);
      // Clear navigation state to prevent message from showing on refresh
      navigate(location.pathname + location.search, { replace: true });
      return () => clearTimeout(timer);
    }
  }, [location.state, location.pathname, location.search, navigate]);

  const loadOrderHistory = async () => {
    try {
      setIsLoadingOrders(true);
      const orders = await ApiService.getOrderHistory();
      
      // Ensure orders is always an array
      if (Array.isArray(orders)) {
        setOrderHistory(orders);
      } else {
        // API returned unexpected format, use empty array
        setOrderHistory([]);
      }
    } catch {
      // API not available yet, silently use empty array
      setOrderHistory([]);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleEditToggle = () => {
    if (!profile) return;
    setEditing((prev) => !prev);
    setFormState(profile);
    setErrors({});
    setMessage(null);
  };

  const handleInputChange = (field: keyof Profile, value: string | Profile["notificationPreferences"]) => {
    if (!formState) return;
    setFormState((prev) => ({
      ...prev!,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prevErrors) => {
        if (!prevErrors[field]) {
          return prevErrors;
        }
        const next = { ...prevErrors };
        delete next[field];
        return next;
      });
    }
  };

  const handlePasswordChange = (field: keyof PasswordForm, value: string) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (passwordErrors[field]) {
      setPasswordErrors((prevErrors) => {
        if (!prevErrors[field]) {
          return prevErrors;
        }
        const next = { ...prevErrors };
        delete next[field];
        return next;
      });
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validatePassword(passwordForm);
    if (Object.keys(nextErrors).length > 0) {
      setPasswordErrors(nextErrors);
      return;
    }

    try {
      await ApiService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setMessage(t("profile.password.success"));
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors({});
      setIsChangingPassword(false);
    } catch (error) {
      console.error('Failed to change password:', error);
      if (error instanceof ApiError) {
        setPasswordErrors({ currentPassword: t("error.password.current.required") });
      } else {
        setMessage(t("error.change.password"));
      }
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState) return;
    
    const nextErrors = validateProfile(formState);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      // Combine address fields for API (backward compatibility)
      const addressString = [
        formState.street,
        formState.city,
        formState.state,
        formState.zipCode,
        formState.country
      ].filter(Boolean).join(', ');

      // Call API to update profile - token is automatically included
      const updatedUser = await ApiService.updateProfile({
        name: formState.name,
        phone: formState.phone,
        address: addressString,
      });

      // Update local profile state immediately
      const updatedProfile: Profile = {
        name: updatedUser.name || "",
        email: updatedUser.email,
        phone: updatedUser.phone || "",
        street: formState.street,
        city: formState.city,
        state: formState.state,
        zipCode: formState.zipCode,
        country: formState.country,
        dateOfBirth: formState.dateOfBirth,
        gender: formState.gender,
        membership: profile?.membership || "Platinum",
        avatar: profile?.avatar || "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
        notificationPreferences: formState.notificationPreferences,
      };
      
      setProfile(updatedProfile);
      setFormState(updatedProfile);
      setMessage(t("profile.update.success"));
      setEditing(false);

      // Refresh user data in auth context (in background)
      refreshUser().catch(err => console.error('Failed to refresh user:', err));
    } catch (error) {
      console.error('Failed to update profile:', error);
      setMessage(t("error.update.profile"));
    }
  };

  const handleSignOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleTabChange = (tab: ProfileTabKey) => {
    setActiveTab(tab);
    const params = new URLSearchParams(location.search);
    if (tab === "profile") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
  };

  const tabList = useMemo(
    () => [
      { key: "profile" as ProfileTabKey, label: "Profile" },
      { key: "orders" as ProfileTabKey, label: "Order History" },
    ],
    [],
  );

  // Show loading state while fetching profile
  if (isLoadingProfile || !profile || !formState) {
    return (
      <section className={styles.root}>
        <div className={styles.mainContent}>
          <div className={styles.orderEmpty}>
            <p>Loading profile...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.root}>
      <div className={styles.mainContent}>
        <div className={styles.tabs}>
          {tabList.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.tabButton} ${activeTab === tab.key ? styles.activeTab : ""}`.trim()}
              onClick={() => handleTabChange(tab.key)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className={styles.tabContent}>
          {activeTab === "profile" && (
            <ProfileTab
              profile={profile}
              formState={formState}
              handleInputChange={handleInputChange}
              errors={errors}
              isEditing={isEditing}
              handleEditToggle={handleEditToggle}
              handleSubmit={handleSubmit}
              message={message}
              onSignOut={handleSignOut}
              passwordForm={passwordForm}
              passwordErrors={passwordErrors}
              handlePasswordChange={handlePasswordChange}
              handlePasswordSubmit={handlePasswordSubmit}
              isChangingPassword={isChangingPassword}
              setIsChangingPassword={setIsChangingPassword}
            />
          )}
          {activeTab === "orders" && (
            <OrderHistoryTab 
              orderHistory={orderHistory} 
              isLoadingOrders={isLoadingOrders} 
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
