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
} from "react-icons/fi";
import { mockOrderHistory, orderStatusLabels, OrderStatus } from "../../data/orders";
import { useAuth } from "../../context/AuthContext";
import { ApiService, ApiError } from "../../services/api";
import CountryPhoneInput from "react-country-phone-input";
import "react-country-phone-input/lib/style.css";
import styles from "./ProfilePage.module.css";

type Profile = {
  name: string;
  email: string;
  phone: string;
  address: string;
  membership: "Platinum" | "Gold" | "Silver";
  avatar: string;
};

type ProfileErrors = Partial<Record<keyof Profile, string>>;

type ProfileTabKey = "profile" | "orders";

const formatCurrency = (value: number) =>
  `$${value.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

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

const validateProfile = (profile: Profile): ProfileErrors => {
  const nextErrors: ProfileErrors = {};
  // Name is optional now
  if (!profile.email.trim()) {
    nextErrors.email = "Please enter an email.";
  }
  // Phone and address are optional
  return nextErrors;
};

type ProfileTabProps = {
  profile: Profile;
  formState: Profile;
  handleInputChange: (field: keyof Profile, value: string) => void;
  errors: ProfileErrors;
  isEditing: boolean;
  handleEditToggle: () => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  message: string | null;
  onSignOut: () => void;
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
}: ProfileTabProps) => {
  return (
    <div className={styles.profileTab}>
      <div className={styles.leftColumn}>
        <div className={styles.mainInfo}>
          <div className={styles.avatarContainer}>
            <img src={profile.avatar} alt={profile.name || "Guest"} className={styles.avatar} />
            <button className={styles.avatarUploadButton} type="button">
              <FiEdit2 />
            </button>
          </div>
          <div className={styles.profileInfo}>
            <h2 className={styles.profileName}>{profile.name || "Guest User"}</h2>
            <p className={styles.profileMembership}>Membership {profile.membership}</p>
          </div>
        </div>
        <button type="button" className={styles.signOutButton} onClick={onSignOut}>
          <FiLogOut className={styles.editIcon} />
          Sign out
        </button>
      </div>
      <div className={styles.rightColumn}>
        <div className={styles.details}>
          {isEditing ? (
            <form className={styles.editForm} onSubmit={handleSubmit} noValidate>
              <div className={styles.formGrid}>
                <label className={styles.formField}>
                  <span>Full name</span>
                  <input
                    type="text"
                    value={formState.name}
                    onChange={(event) => handleInputChange("name", event.target.value)}
                    className={`${styles.formInput} ${errors.name ? styles.formInputError : ""}`.trim()}
                  />
                  {errors.name && <p className={styles.errorText}>{errors.name}</p>}
                </label>
                <label className={styles.formField}>
                  <span>Email</span>
                  <input
                    type="email"
                    value={formState.email}
                    onChange={(event) => handleInputChange("email", event.target.value)}
                    className={`${styles.formInput} ${errors.email ? styles.formInputError : ""}`.trim()}
                  />
                  {errors.email && <p className={styles.errorText}>{errors.email}</p>}
                </label>
                <label className={styles.formField}>
                  <span>Phone number</span>
                  <div className={styles.phoneInputWrapper}>
                    <CountryPhoneInput
                      value={formState.phone}
                      onChange={(value: string) => {
                        handleInputChange("phone", value);
                      }}
                      placeholder="Enter phone number"
                      enableSearch={true}
                    />
                  </div>
                  {errors.phone && <p className={styles.errorText}>{errors.phone}</p>}
                </label>
                <label className={styles.formField}>
                  <span>Shipping address</span>
                  <textarea
                    value={formState.address}
                    onChange={(event) => handleInputChange("address", event.target.value)}
                    rows={3}
                    className={styles.formTextarea}
                  />
                </label>
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
            <div className={styles.profileDetails}>
              <div className={styles.detailItem}>
                <FiMail className={styles.detailIcon} />
                <div>
                  <p className={styles.detailLabel}>Email</p>
                  <p className={styles.detailValue}>{profile.email}</p>
                </div>
              </div>
              <div className={styles.detailItem}>
                <FiPhone className={styles.detailIcon} />
                <div>
                  <p className={styles.detailLabel}>Phone</p>
                  <p className={styles.detailValue}>{profile.phone}</p>
                </div>
              </div>
              <div className={styles.detailItem}>
                <FiMapPin className={styles.detailIcon} />
                <div>
                  <p className={styles.detailLabel}>Address</p>
                  <p className={styles.detailValue}>{profile.address}</p>
                </div>
              </div>
              <div className={styles.editHint}>
                <button className={styles.editButton} onClick={handleEditToggle} type="button">
                  <FiEdit2 className={styles.editIcon} />
                  Edit profile
                </button>
              </div>
            </div>
          )}
          {message && <div className={styles.successMessage}>{message}</div>}
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
                      <p className={styles.orderItemQuantity}>Qty {item.quantity}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <footer className={styles.orderFooter}>
                <div className={styles.orderFooterLeft}>
                  <p className={styles.orderFooterText}>
                    Subtotal {formatCurrency(order.subtotal)} - {shippingLabel}
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
                  This order was cancelled before fulfillment. Reach out to concierge support for help.
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setEditing] = useState(false);
  const [formState, setFormState] = useState<Profile | null>(null);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTabKey>("profile");
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

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
        
        const userProfile: Profile = {
          name: profileData.name || "", // Leave empty if no name, don't show user_code
          email: profileData.email,
          phone: profileData.phone || "",
          address: profileData.address || "",
          membership: "Platinum", // Default membership
          avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
        };
        
        setProfile(userProfile);
        setFormState(userProfile);
      } catch (error) {
        console.error('[ProfilePage] Failed to load profile:', error);
        setMessage("Failed to load profile. Please try again.");
        
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
    } catch (error) {
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

  const handleInputChange = (field: keyof Profile, value: string) => {
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState) return;
    
    const nextErrors = validateProfile(formState);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      // Call API to update profile - token is automatically included
      const updatedUser = await ApiService.updateProfile({
        name: formState.name,
        phone: formState.phone,
        address: formState.address,
      });

      // Update local profile state immediately
      const updatedProfile: Profile = {
        name: updatedUser.name || "",
        email: updatedUser.email,
        phone: updatedUser.phone || "",
        address: updatedUser.address || "",
        membership: profile?.membership || "Platinum",
        avatar: profile?.avatar || "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
      };
      
      setProfile(updatedProfile);
      setFormState(updatedProfile);
      setMessage("Profile updated successfully!");
      setEditing(false);

      // Refresh user data in auth context (in background)
      refreshUser().catch(err => console.error('Failed to refresh user:', err));
    } catch (error) {
      console.error('Failed to update profile:', error);
      setMessage("Failed to update profile. Please try again.");
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
