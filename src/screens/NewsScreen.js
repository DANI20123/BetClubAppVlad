// src/screens/NewsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import CustomModal from '../components/Modal';

const NewsScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [newsModalVisible, setNewsModalVisible] = useState(false);

  const [news, setNews] = useState([
    {
      id: 1,
      title: 'New Training Schedule Available',
      content: 'We are excited to announce our updated training schedule for December 2025. New morning sessions have been added, and weekend marathon training is now available for all members.',
      date: '2 hours ago',
      author: 'Admin Team',
      important: true,
      category: 'schedule'
    },
    {
      id: 2,
      title: 'Weekend Marathon Preparation',
      content: 'Special marathon training sessions every Saturday at 9:00 AM. Focus on endurance, pacing, and proper running technique. All levels welcome!',
      date: '1 day ago',
      author: 'Coach Maria',
      important: false,
      category: 'training'
    },
    {
      id: 3,
      title: 'Equipment Maintenance Notice',
      content: 'Please be advised that gym equipment maintenance is scheduled for next week. Some machines might be temporarily unavailable. We apologize for any inconvenience.',
      date: '3 days ago',
      author: 'Facility Manager',
      important: true,
      category: 'facility'
    },
    {
      id: 4,
      title: 'New Yoga Sessions Added',
      content: 'Starting next week, we are introducing yoga sessions specifically designed for runners. Improve your flexibility and recovery with our certified instructors.',
      date: '5 days ago',
      author: 'Coach Elena',
      important: false,
      category: 'training'
    }
  ]);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const openNewsDetail = (newsItem) => {
    setSelectedNews(newsItem);
    setNewsModalVisible(true);
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'schedule': return '#FF4444';
      case 'training': return '#00C851';
      case 'facility': return '#33B5E5';
      default: return '#888';
    }
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'schedule': return 'calendar-alt';
      case 'training': return 'running';
      case 'facility': return 'tools';
      default: return 'info-circle';
    }
  };

  const NewsCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.newsCard}
      onPress={() => openNewsDetail(item)}
    >
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.newsGradient}>
        {item.important && (
          <View style={styles.importantBadge}>
            <FontAwesome5 name="exclamation-circle" size={12} color="#FF4444" />
            <Text style={styles.importantText}>IMPORTANT</Text>
          </View>
        )}
        
        <View style={styles.newsHeader}>
          <View style={styles.categoryTag}>
            <FontAwesome5 
              name={getCategoryIcon(item.category)} 
              size={12} 
              color={getCategoryColor(item.category)} 
            />
            <Text style={[styles.categoryText, { color: getCategoryColor(item.category) }]}>
              {item.category.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.newsDate}>{item.date}</Text>
        </View>

        <Text style={styles.newsTitle}>{item.title}</Text>
        <Text style={styles.newsPreview} numberOfLines={2}>
          {item.content}
        </Text>

        <View style={styles.newsFooter}>
          <View style={styles.authorInfo}>
            <FontAwesome5 name="user" size={10} color="#00FF88" />
            <Text style={styles.authorText}>By {item.author}</Text>
          </View>
          <FontAwesome5 name="chevron-right" size={12} color="#666" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#0f3460']} style={styles.header}>
        <Text style={styles.headerTitle}>Club News</Text>
        <Text style={styles.headerSubtitle}>Updates & Announcements</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Important Announcements */}
        {news.filter(item => item.important).length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome5 name="exclamation-triangle" size={16} color="#FF4444" />
              <Text style={styles.sectionTitle}>Important Announcements</Text>
            </View>
            {news.filter(item => item.important).map(item => (
              <NewsCard key={item.id} item={item} />
            ))}
          </View>
        )}

        {/* All News */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FontAwesome5 name="newspaper" size={16} color="#33B5E5" />
            <Text style={styles.sectionTitle}>All Updates</Text>
          </View>
          {news.filter(item => !item.important).map(item => (
            <NewsCard key={item.id} item={item} />
          ))}
        </View>
      </ScrollView>

      {/* News Detail Modal */}
      <CustomModal
        visible={newsModalVisible}
        onClose={() => setNewsModalVisible(false)}
        title={selectedNews?.title}
      >
        {selectedNews && (
          <>
            <View style={styles.modalHeader}>
              <View style={styles.modalCategory}>
                <FontAwesome5 
                  name={getCategoryIcon(selectedNews.category)} 
                  size={14} 
                  color={getCategoryColor(selectedNews.category)} 
                />
                <Text style={[styles.modalCategoryText, { color: getCategoryColor(selectedNews.category) }]}>
                  {selectedNews.category.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.modalDate}>{selectedNews.date}</Text>
            </View>

            <Text style={styles.modalContent}>
              {selectedNews.content}
            </Text>

            <View style={styles.modalFooter}>
              <View style={styles.modalAuthor}>
                <FontAwesome5 name="user" size={12} color="#00FF88" />
                <Text style={styles.modalAuthorText}>Published by {selectedNews.author}</Text>
              </View>
            </View>
          </>
        )}
      </CustomModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    color: '#888',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  newsCard: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  newsGradient: {
    padding: 20,
  },
  importantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,68,68,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  importantText: {
    color: '#FF4444',
    fontSize: 8,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  newsDate: {
    color: '#888',
    fontSize: 10,
  },
  newsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  newsPreview: {
    color: '#888',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorText: {
    color: '#00FF88',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  modalCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalCategoryText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  modalDate: {
    color: '#888',
    fontSize: 12,
  },
  modalContent: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
  },
  modalFooter: {
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#1a1a2e',
  },
  modalAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalAuthorText: {
    color: '#00FF88',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default NewsScreen;