// React Imports
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

// MUI Core Imports
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import useMediaQuery from '@mui/material/useMediaQuery';
import Skeleton from '@mui/material/Skeleton';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';

// MUI Table Components
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';

// MUI Dialog and Feedback Components
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Alert from '@mui/material/Alert';
import Slide from '@mui/material/Slide';
import Fade from '@mui/material/Fade';
import Tooltip from '@mui/material/Tooltip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Modal from '@mui/material/Modal';
import Backdrop from '@mui/material/Backdrop';

// MUI Form Components
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

// MUI Menu Components
import Menu from '@mui/material/Menu';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

// MUI Icons
import SavingsIcon from '@mui/icons-material/Savings';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import MouseIcon from '@mui/icons-material/Mouse';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import PendingIcon from '@mui/icons-material/Pending';
import RefreshIcon from '@mui/icons-material/Refresh';
import SecurityIcon from '@mui/icons-material/Security';
import CancelIcon from '@mui/icons-material/Cancel';

// API Base URL - You can change this for different environments if needed
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// Export everything
export {
  // React
  React, useState, useEffect, useMemo, useRef,
  RouterLink, useNavigate,
  
  // MUI Core
  useTheme, Container, Typography, Button, Box, Grid,
  Card, CardContent, CardActions, Paper, TextField,
  useMediaQuery, Skeleton, CircularProgress, Link,
  
  // MUI Table
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip,
  
  // MUI Dialog
  IconButton, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, Alert, Slide, Fade, Tooltip, ClickAwayListener,
  Modal, Backdrop,
  
  // MUI Form
  Select, MenuItem, FormControl, InputLabel,
  
  // MUI Menu
  Menu, ListItemIcon, ListItemText,
  
  // MUI Icons
  SavingsIcon, UpgradeIcon, AccountBalanceWalletIcon, MouseIcon,
  AutoAwesomeIcon, MonetizationOnIcon, CheckCircleIcon, ErrorIcon,
  WarningIcon, InfoIcon, CloseIcon, ContentCopyIcon, SettingsIcon,
  AdminPanelSettingsIcon, ArrowBackIcon, FilterListIcon, SearchIcon,
  PendingIcon, RefreshIcon, SecurityIcon, CancelIcon,
  
  // API 
  API_BASE_URL
};